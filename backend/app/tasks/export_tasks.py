"""Celery tasks for exporting projects (placeholder)."""

@Celery
def export_project(project_id):
    return {"project_id": project_id, "status": "exported"}
