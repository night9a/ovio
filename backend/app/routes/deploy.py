"""Routes for publicly accessing deployed projects."""
from flask import Blueprint, abort, current_app
from ..models import Host, Project
import os
import json

bp = Blueprint("deploy", __name__, url_prefix="/app")


@bp.route("/<deployment_slug>", methods=["GET"])
def view_deployed_app(deployment_slug):
    """Serve a publicly deployed project app."""
    host = Host.query.filter_by(url=f"/app/{deployment_slug}", status="active").first()
    
    if not host:
        abort(404)
    
    project = Project.query.get(host.project_id)
    if not project:
        abort(404)
    
    # Load project state from disk
    try:
        storage_root = os.path.abspath(os.path.join(current_app.root_path, '..', 'projects_storage'))
        state_path = os.path.join(storage_root, str(project.id), 'state.json')
        if not os.path.exists(state_path):
            state = {"id": project.id, "name": project.name, "canvas": []}
        else:
            with open(state_path, 'r', encoding='utf-8') as f:
                state = json.load(f)
    except Exception as e:
        current_app.logger.error('failed to load deployed project state: %s', e)
        state = {"id": project.id, "name": project.name, "canvas": []}
    
    # Parse components for rendering
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
    
    # Build HTML with embedded components
    html_page = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{project.name} - OVIO</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }}
        .component-item {{
            display: inline-block;
            position: absolute;
            padding: 1rem;
            border: 1px dashed #d1d5db;
            background: white;
            border-radius: 0.5rem;
            transition: all 0.2s;
        }}
        .component-item:hover {{
            border-color: #3b82f6;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        button.component-button {{
            background-color: black;
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            border: none;
            font-size: 1rem;
            transition: background-color 0.2s;
        }}
        button.component-button:hover {{
            background-color: #1f2937;
        }}
        .canvas-container {{
            position: relative;
            width: 100%;
            min-height: 500px;
            background: white;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }}
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex flex-col">
        <!-- Header -->
        <nav class="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shadow-sm">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-sm">O</span>
                </div>
                <span class="text-xl font-light tracking-wider">OVIO</span>
            </div>
            <span class="text-gray-600 text-sm">/ {project.name}</span>
            <div class="ml-auto text-xs text-gray-500">
                Deployed with <a href="/" class="text-blue-600 hover:underline">OVIO</a>
            </div>
        </nav>
        
        <!-- Canvas -->
        <main class="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div class="canvas-container" style="max-width: 1200px;">
                {components_html}
            </div>
        </main>
    </div>
    
    <script>
        function handleComponentAction(componentId) {{
            console.log('Component ' + componentId + ' clicked');
            alert('Component action triggered');
        }}
    </script>
</body>
</html>"""
    
    return html_page
