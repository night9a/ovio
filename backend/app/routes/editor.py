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
from ..services.project_service import ProjectService, ProjectError
from ..services.editor_converter import EditorConverter
from ..utils.msg_serializer import MsgSerializer


bp = Blueprint("editor", __name__, url_prefix="/editor")


@bp.route("/<project_id>/state", methods=["GET"])
@require_auth
def get_project_state(project_id):
    """Return stored project state from msgpack (converted to JSON for frontend)"""
    user = request.current_user
    project = Project.query.filter_by(id=project_id, owner_id=user.id).first()
    if not project:
        return jsonify({"error": "project not found"}), 404

    storage_root = ProjectService.get_storage_root()
    proj_dir = os.path.join(storage_root, str(project.id), "autosave")
    print(proj_dir)
    ui_dir = os.path.join(proj_dir, "ui")
    relation_dir = os.path.join(proj_dir, "relation")
    
    ui_main_path = os.path.join(ui_dir, "main.msgpack")
    relation_main_path = os.path.join(relation_dir, "main.msgpack")

    try:
        # Load msgpack files
        ui_dict = MsgSerializer(ui_main_path)._load()
        relation_dict = MsgSerializer(relation_main_path)._load()
        print(ui_dict)
        # Debug logging
        current_app.logger.info(f'GET /editor/{project_id}/state - UI path: {ui_main_path}')
        current_app.logger.info(f'GET /editor/{project_id}/state - UI dict keys: {list(ui_dict.keys())}')
        current_app.logger.info(f'GET /editor/{project_id}/state - UI elements count: {len(ui_dict.get("elements", []))}')
        current_app.logger.info(f'GET /editor/{project_id}/state - Relation dict keys: {list(relation_dict.keys())}')
        
        # Convert to frontend canvas format
        canvas = EditorConverter.msgpack_to_canvas(ui_dict, relation_dict)
        print(canvas)
        current_app.logger.info(f'GET /editor/{project_id}/state - Converted canvas: {len(canvas)} components')
        if canvas:
            for comp in canvas:
                current_app.logger.info(f'  Component: {comp.get("id")} - {comp.get("props")}')
        
        # Return in expected format
        return jsonify({"canvas": canvas, "id": project_id}), 200
    except Exception as e:
        current_app.logger.error(f'GET /editor/{project_id}/state - failed to read state: {e}', exc_info=True)
        # Return empty canvas if files don't exist yet
        return jsonify({"canvas": [], "id": project_id}), 200



@bp.route("/<project_id>/state", methods=["POST"])
@require_auth
def save_project_state(project_id):
    """Save project state from frontend JSON to msgpack and broadcast via socketio"""
    user = request.current_user
    project = Project.query.filter_by(id=project_id, owner_id=user.id).first()
    if not project:
        return jsonify({"error": "project not found"}), 404

    data = request.get_json() or {}
    canvas = data.get('canvas', [])

    storage_root = ProjectService.get_storage_root()
    proj_dir = os.path.join(storage_root, str(project.id), "autosave")
    ui_dir = os.path.join(proj_dir, "ui")
    relation_dir = os.path.join(proj_dir, "relation")
    os.makedirs(ui_dir, exist_ok=True)
    os.makedirs(relation_dir, exist_ok=True)
    
    ui_main_path = os.path.join(ui_dir, "main.msgpack")
    relation_main_path = os.path.join(relation_dir, "main.msgpack")
    
    # Check if existing state has content and new state is empty - prevent clearing
    existing_ui = MsgSerializer(ui_main_path)._load()
    if existing_ui and existing_ui.get('elements') and len(existing_ui.get('elements', [])) > 0:
        if not canvas or len(canvas) == 0:
            current_app.logger.warning('Prevented clearing project state: existing elements has %d items, new canvas is empty', len(existing_ui.get('elements', [])))
            return jsonify({"success": True, "message": "state preserved (prevented clearing)"}), 200

    try:
        # Convert frontend canvas to msgpack format
        ui_dict, relation_dict = EditorConverter.canvas_to_msgpack(canvas)
        
        # Save to msgpack files
        MsgSerializer(ui_main_path)._save(ui_dict)
        MsgSerializer(relation_main_path)._save(relation_dict)
    except Exception as e:
        current_app.logger.error('failed to write state: %s', e)
        return jsonify({"error": "failed to save state"}), 500

    # Broadcast to other collaborators (send original data format for compatibility)
    try:
        room = f"project_{project.id}"
        socketio.emit('state_update', {'project_id': project.id, 'state': data}, room=room, include_self=False)
    except Exception:
        current_app.logger.exception('socket emit failed')

    return jsonify({"success": True}), 200

