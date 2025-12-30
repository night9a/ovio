"""Routes for publicly accessing deployed projects."""
from flask import Blueprint, jsonify, request, current_app
from ..models import Host, Project
from ..headers.auth_header import require_auth
from ..services.deploy_service import DeployError,DeployService
import os
import json

bp = Blueprint("deploy", __name__, url_prefix="/deploy")


@bp.route("/<string:project_id>/deploy", methods=["GET"])
#@require_auth CURRENTLY TESTING
def deploy_project(project_id):
    #check if project exist in user and have permission
    #data = request.get_json() or {}
    data = "test"
    if data:
        a = DeployService.deploy_project(project_id,data)
        return a 
    return jsonify({"error": "project not found"}), 404

#TODO to move into deploy route
"""
@bp.route("/<int:project_id>/deploy", methods=["POST"])
@require_auth
def deploy_project(project_id):
    Deploy project to web and create a public link.
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

    html_page = f<!DOCTYPE html>
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
</html>

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
"""
