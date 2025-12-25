"""Project-related routes for CRUD operations and real-time collaboration."""
from flask import Blueprint, jsonify, request, current_app
from ..extensions import db, socketio
from ..models import Project, User, Host
from ..headers.auth_header import require_auth
from datetime import datetime
import os
import json
from flask_socketio import join_room, leave_room
from flask import session, send_file
from collections import defaultdict
from ..services.project_service import ProjectService,ProjectError


bp = Blueprint("editor", __name__, url_prefix="/editor")


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

