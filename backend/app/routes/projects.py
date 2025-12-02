"""Project-related routes for CRUD operations."""
from flask import Blueprint, jsonify, request
from ..extensions import db
from ..models import Project, User
from .auth import require_auth
from datetime import datetime

bp = Blueprint("projects", __name__, url_prefix="/projects")


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
    
    return jsonify({
        "id": project.id,
        "name": project.name,
        "owner_id": project.owner_id,
        "created_at": project.created_at.isoformat() if project.created_at else None
    }), 201


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
