"""Project-related routes for CRUD operations and real-time collaboration."""
from flask import Blueprint, jsonify, request, current_app
from ..extensions import db, socketio
from ..models import Project, User, Host
from .auth import require_auth
from datetime import datetime
import os
import json
from flask_socketio import join_room, leave_room
from flask import session, send_file
from collections import defaultdict

bp = Blueprint("projects", __name__, url_prefix="/projects")

# In-memory presence tracking per project: {project_id: {sid: user_dict}}
_project_presence = defaultdict(dict)


def _serialize_user(user: User):
    """Return a minimal public representation of a user."""
    if not user:
        return None
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name or user.username,
    }


def _broadcast_presence(project_id: int):
    """Emit the current presence list for a project to all clients in the room."""
    room = f"project_{project_id}"
    users = list(_project_presence.get(project_id, {}).values())
    socketio.emit(
        "presence_update",
        {"project_id": project_id, "users": users},
        room=room,
        include_self=True,
    )


@bp.route("/", methods=["GET"])
@require_auth
def list_projects():
    """List all projects for the authenticated user."""
    user = request.current_user
    projects = Project.query.filter_by(owner_id=user.id).all()
    
    return jsonify({
        "projects": [
            {
                "id": p.id,
                "name": p.name,
                "owner_id": p.owner_id,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in projects
        ]
    }), 200


@bp.route("/", methods=["POST"])
@require_auth
def create_project():
    """Create a new project for the authenticated user."""
    user = request.current_user
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    
    if not name:
        return jsonify({"error": "project name is required"}), 400
    
    # Check if project with same name already exists for this user
    existing = Project.query.filter_by(name=name, owner_id=user.id).first()
    if existing:
        return jsonify({"error": "project with this name already exists"}), 400
    
    project = Project(name=name, owner_id=user.id)
    db.session.add(project)
    db.session.commit()

    # Create on-disk project storage folder and initial state
    try:
        storage_root = os.path.abspath(os.path.join(current_app.root_path, '..', 'projects_storage'))
        os.makedirs(storage_root, exist_ok=True)
        proj_dir = os.path.join(storage_root, str(project.id))
        os.makedirs(proj_dir, exist_ok=True)
        # initial state file
        state_path = os.path.join(proj_dir, 'state.json')
        initial_state = {"id": project.id, "name": project.name, "canvas": []}
        with open(state_path, 'w', encoding='utf-8') as f:
            json.dump(initial_state, f)
    except Exception as e:
        current_app.logger.error('failed to create project storage: %s', e)
    
    return jsonify({
        "id": project.id,
        "name": project.name,
        "owner_id": project.owner_id,
        "created_at": project.created_at.isoformat() if project.created_at else None
    }), 201


@bp.route("/<int:project_id>/collaborators", methods=["POST"])
@require_auth
def add_project_collaborator(project_id: int):
    """Allow a project owner to add a collaborator by email.

    For now this is a lightweight helper that simply verifies the user exists
    and returns their public profile; it does not persist collaborator
    memberships yet.
    """
    owner = request.current_user
    project = Project.query.filter_by(id=project_id, owner_id=owner.id).first()
    if not project:
        return jsonify({"error": "project not found"}), 404

    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "user not found"}), 404

    # Broadcast collaborator addition via Socket.IO to all clients in the project room
    user_data = _serialize_user(user)
    try:
        room = f"project_{project_id}"
        socketio.emit(
            "collaborator_added",
            {"project_id": project_id, "user": user_data},
            room=room,
            include_self=True,
        )
    except Exception:
        current_app.logger.exception('socket emit failed for collaborator_added')

    return jsonify(user_data), 200


@bp.route("/<int:project_id>", methods=["GET"])
@require_auth
def get_project(project_id):
    """Get a specific project by ID."""
    user = request.current_user
    project = Project.query.filter_by(id=project_id, owner_id=user.id).first()
    
    if not project:
        return jsonify({"error": "project not found"}), 404
    
    return jsonify({
        "id": project.id,
        "name": project.name,
        "owner_id": project.owner_id,
        "created_at": project.created_at.isoformat() if project.created_at else None
    }), 200


@bp.route("/<int:project_id>/state", methods=["GET"])
@require_auth
def get_project_state(project_id):
    """Return stored project state (JSON)"""
    user = request.current_user
    project = Project.query.filter_by(id=project_id, owner_id=user.id).first()
    if not project:
        return jsonify({"error": "project not found"}), 404

    storage_root = os.path.abspath(os.path.join(current_app.root_path, '..', 'projects_storage'))
    state_path = os.path.join(storage_root, str(project.id), 'state.json')
    if not os.path.exists(state_path):
        return jsonify({"error": "state not found"}), 404

    try:
        with open(state_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        current_app.logger.error('failed to read state: %s', e)
        return jsonify({"error": "failed to read state"}), 500

    return jsonify(data), 200


@bp.route("/<int:project_id>/state", methods=["POST"])
@require_auth
def save_project_state(project_id):
    """Save project state (JSON) to disk and broadcast via socketio"""
    user = request.current_user
    project = Project.query.filter_by(id=project_id, owner_id=user.id).first()
    if not project:
        return jsonify({"error": "project not found"}), 404

    data = request.get_json() or {}
    canvas = data.get('canvas', [])

    storage_root = os.path.abspath(os.path.join(current_app.root_path, '..', 'projects_storage'))
    proj_dir = os.path.join(storage_root, str(project.id))
    os.makedirs(proj_dir, exist_ok=True)
    state_path = os.path.join(proj_dir, 'state.json')
    
    # Check if existing state has content and new state is empty - prevent clearing
    existing_state = None
    if os.path.exists(state_path):
        try:
            with open(state_path, 'r', encoding='utf-8') as f:
                existing_state = json.load(f)
        except Exception:
            pass
    
    # Only save if: new state has content OR no existing state exists
    if existing_state and existing_state.get('canvas') and len(existing_state.get('canvas', [])) > 0:
        if not canvas or len(canvas) == 0:
            # Don't overwrite existing content with empty state
            current_app.logger.warning('Prevented clearing project state: existing canvas has %d items, new canvas is empty', len(existing_state.get('canvas', [])))
            return jsonify({"success": True, "message": "state preserved (prevented clearing)"}), 200

    try:
        with open(state_path, 'w', encoding='utf-8') as f:
            json.dump(data, f)
    except Exception as e:
        current_app.logger.error('failed to write state: %s', e)
        return jsonify({"error": "failed to save state"}), 500

    # Broadcast to other collaborators
    try:
        room = f"project_{project.id}"
        socketio.emit('state_update', {'project_id': project.id, 'state': data}, room=room, include_self=False)
    except Exception:
        current_app.logger.exception('socket emit failed')

    return jsonify({"success": True}), 200


# --- Socket.IO handlers for real-time collaboration ---
@socketio.on('join_project')
def socket_join_project(data):
    try:
        project_id = int(data.get('project_id'))
    except Exception:
        return
    room = f"project_{project_id}"
    join_room(room)

    # track presence (best-effort, unauthenticated at socket layer)
    user_info = {
        "id": data.get("user_id"),
        "username": data.get("username"),
        "name": data.get("name") or data.get("username"),
    }
    # filter out completely empty presence payloads
    if any(user_info.values()):
        _project_presence[project_id][request.sid] = user_info
        _broadcast_presence(project_id)


@socketio.on('leave_project')
def socket_leave_project(data):
    try:
        project_id = int(data.get('project_id'))
    except Exception:
        return
    room = f"project_{project_id}"
    leave_room(room)

    # remove from presence map if tracked
    presence_map = _project_presence.get(project_id)
    if presence_map and request.sid in presence_map:
        presence_map.pop(request.sid, None)
        if not presence_map:
            _project_presence.pop(project_id, None)
        _broadcast_presence(project_id)


@socketio.on('state_update')
def socket_state_update(data):
    # Broadcast incoming state update to other clients in the room
    try:
        project_id = int(data.get('project_id'))
    except Exception:
        return
    room = f"project_{project_id}"
    state = data.get('state')
    canvas = state.get('canvas', []) if state else []
    
    # Prevent clearing existing state with empty canvas
    storage_root = os.path.abspath(os.path.join(current_app.root_path, '..', 'projects_storage'))
    proj_dir = os.path.join(storage_root, str(project_id))
    state_path = os.path.join(proj_dir, 'state.json')
    
    existing_state = None
    if os.path.exists(state_path):
        try:
            with open(state_path, 'r', encoding='utf-8') as f:
                existing_state = json.load(f)
        except Exception:
            pass
    
    # Only persist if: new state has content OR no existing state exists
    if existing_state and existing_state.get('canvas') and len(existing_state.get('canvas', [])) > 0:
        if not canvas or len(canvas) == 0:
            # Don't overwrite existing content with empty state
            current_app.logger.warning('Prevented clearing project state via socket: existing canvas has %d items, new canvas is empty', len(existing_state.get('canvas', [])))
            return  # Don't broadcast or persist empty state
    
    # broadcast to room excluding sender
    socketio.emit('state_update', {'project_id': project_id, 'state': state}, room=room, include_self=False)
    # persist to disk (best-effort, no auth over socket)
    try:
        os.makedirs(proj_dir, exist_ok=True)
        with open(state_path, 'w', encoding='utf-8') as f:
            json.dump(state, f)
    except Exception:
        current_app.logger.exception('failed to persist state from socket')


@socketio.on("disconnect")
def socket_disconnect():
    """Clean up presence entries when a client disconnects unexpectedly."""
    # iterate over a copy of items to allow mutation
    sid = request.sid
    projects_to_update = []
    for project_id, presence_map in list(_project_presence.items()):
        if sid in presence_map:
            presence_map.pop(sid, None)
            if not presence_map:
                _project_presence.pop(project_id, None)
            projects_to_update.append(project_id)

    for pid in projects_to_update:
        _broadcast_presence(pid)


@bp.route("/<int:project_id>", methods=["PUT"])
@require_auth
def update_project(project_id):
    """Update a project."""
    user = request.current_user
    project = Project.query.filter_by(id=project_id, owner_id=user.id).first()
    
    if not project:
        return jsonify({"error": "project not found"}), 404
    
    data = request.get_json() or {}
    
    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "project name cannot be empty"}), 400
        
        # Check if new name conflicts with existing projects
        existing = Project.query.filter_by(name=name, owner_id=user.id).first()
        if existing and existing.id != project_id:
            return jsonify({"error": "project with this name already exists"}), 400
        
        project.name = name
    
    db.session.commit()
    
    return jsonify({
        "id": project.id,
        "name": project.name,
        "owner_id": project.owner_id,
        "created_at": project.created_at.isoformat() if project.created_at else None
    }), 200


@bp.route("/<int:project_id>", methods=["DELETE"])
@require_auth
def delete_project(project_id):
    """Delete a project."""
    user = request.current_user
    project = Project.query.filter_by(id=project_id, owner_id=user.id).first()
    
    if not project:
        return jsonify({"error": "project not found"}), 404
    
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({"success": True, "message": "project deleted successfully"}), 200


@bp.route("/<int:project_id>/deploy", methods=["POST"])
@require_auth
def deploy_project(project_id):
    """Deploy project to web and create a public link."""
    user = request.current_user
    project = Project.query.filter_by(id=project_id, owner_id=user.id).first()
    
    if not project:
        return jsonify({"error": "project not found"}), 404
    
    # Check if project already has an active deployment
    existing_host = Host.query.filter_by(project_id=project_id, status="active").first()
    if existing_host:
        # Return existing deployment
        return jsonify({
            "id": existing_host.id,
            "url": existing_host.url,
            "deployment_date": existing_host.deployment_date.isoformat() if existing_host.deployment_date else None,
            "status": existing_host.status
        }), 200
    
    # Generate a unique slug for the deployment (e.g., "myproject-abc123")
    import random
    import string
    slug = project.name.lower().replace(" ", "-")[:20]
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    deployment_slug = f"{slug}-{random_suffix}"
    
    # Decide storage paths
    storage_root = os.path.abspath(os.path.join(current_app.root_path, '..', 'projects_storage'))
    proj_dir = os.path.join(storage_root, str(project.id))
    os.makedirs(proj_dir, exist_ok=True)
    deploy_dir = os.path.join(proj_dir, 'deploy')
    os.makedirs(deploy_dir, exist_ok=True)
    index_path = os.path.join(deploy_dir, 'index.html')

    # If an active deployment exists, reuse its URL and update the static file
    if existing_host:
        host = existing_host
        host.deployment_date = datetime.utcnow()
        db.session.commit()
    else:
        # Create Host record
        host = Host(
            project_id=project_id,
            url=f"/app/{deployment_slug}",
            status="active"
        )
        db.session.add(host)
        db.session.commit()

    # Load current project state (latest)
    state_path = os.path.join(proj_dir, 'state.json')
    try:
        if os.path.exists(state_path):
            with open(state_path, 'r', encoding='utf-8') as f:
                state = json.load(f)
        else:
            state = {"id": project.id, "name": project.name, "canvas": []}
    except Exception:
        state = {"id": project.id, "name": project.name, "canvas": []}

    # Render static HTML for deployment (same logic as deploy view)
    canvas = state.get('canvas', [])
    components_html = ""
    for idx, comp in enumerate(canvas):
        comp_type = comp.get('id', '').split('-')[0]
        props = comp.get('props', {})
        x = int(comp.get('x', 0))
        y = int(comp.get('y', 0))
        if comp_type == 'button':
            label = props.get('label', 'Button')
            components_html += f'<div class="component-item" style="left: {x}px; top: {y}px;"><button class="component-button" onclick="handleComponentAction({idx})">{label}</button></div>\n'
        elif comp_type == 'text':
            text = props.get('text', 'Sample Text')
            components_html += f'<div class="component-item" style="left: {x}px; top: {y}px;"><div class="text-gray-700">{text}</div></div>\n'
        elif comp_type == 'heading':
            text = props.get('text', 'Heading')
            components_html += f'<div class="component-item" style="left: {x}px; top: {y}px;"><h1 class="text-2xl font-bold">{text}</h1></div>\n'
        elif comp_type == 'image':
            components_html += f'<div class="component-item" style="left: {x}px; top: {y}px;"><div class="w-48 h-32 bg-gray-200 flex items-center justify-center text-gray-500">Image</div></div>\n'
        elif comp_type == 'card':
            components_html += f'<div class="component-item" style="left: {x}px; top: {y}px;"><div class="w-64 h-48 bg-white border border-gray-200 rounded-lg shadow-md p-4"><div class="text-sm font-semibold text-gray-700">Card Component</div></div></div>\n'
        else:
            name = comp.get('name', 'Component')
            components_html += f'<div class="component-item" style="left: {x}px; top: {y}px;"><div class="text-gray-500">{name}</div></div>\n'

    html_page = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{project.name} - OVIO</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }}
        .component-item {{ display: inline-block; position: absolute; padding: 1rem; border: 1px dashed #d1d5db; background: white; border-radius: 0.5rem; transition: all 0.2s; }}
        .component-item:hover {{ border-color: #3b82f6; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
        button.component-button {{ background-color: black; color: white; padding: 0.5rem 1.5rem; border-radius: 0.5rem; cursor: pointer; border: none; font-size: 1rem; transition: background-color 0.2s; }}
        button.component-button:hover {{ background-color: #1f2937; }}
        .canvas-container {{ position: relative; width: 100%; min-height: 500px; background: white; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }}
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex flex-col">
        <nav class="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shadow-sm"><div class="flex items-center gap-3"><div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center"><span class="text-white font-bold text-sm">O</span></div><span class="text-xl font-light tracking-wider">OVIO</span></div><span class="text-gray-600 text-sm">/ {project.name}</span><div class="ml-auto text-xs text-gray-500">Deployed with <a href="/" class="text-blue-600 hover:underline">OVIO</a></div></nav>
        <main class="flex-1 flex items-center justify-center p-8 overflow-auto"><div class="canvas-container" style="max-width: 1200px;">{components_html}</div></main>
    </div>
    <script>function handleComponentAction(componentId){{console.log('Component ' + componentId + ' clicked');alert('Component action triggered');}}</script>
</body>
</html>"""

    # Write static file to deploy directory
    try:
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(html_page)
    except Exception:
        current_app.logger.exception('failed to write deployment static file')

    # Build full_url using EXTERNAL_BASE_URL config when available
    external_base = current_app.config.get('EXTERNAL_BASE_URL')
    if not external_base:
        server_name = request.environ.get('SERVER_NAME')
        server_port = request.environ.get('SERVER_PORT')
        if server_name and server_port:
            external_base = f"{request.scheme}://{server_name}:{server_port}"
        else:
            external_base = request.host_url.rstrip('/')

    full_url = f"{external_base}{host.url}"

    return jsonify({
        "id": host.id,
        "url": host.url,
        "full_url": full_url,
        "deployment_date": host.deployment_date.isoformat() if host.deployment_date else None,
        "status": host.status
    }), 201
