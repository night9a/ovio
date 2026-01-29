"""
Converter between frontend canvas format and msgpack storage format.
Frontend: {canvas: [{id, uniqueId, x, y, props: {...}, actions: [...]}]}
Msgpack UI: {page: "main", window: {...}, elements: [{type, value, action_id?}]}
Msgpack Relation: {scripts: [{action_id, response: {type, msg}}]}
"""

from typing import Dict, List, Any
from ..utils.ids import short_id


class EditorConverter:
    """Convert between frontend editor format and msgpack storage format."""

    @staticmethod
    def canvas_to_msgpack(canvas: List[Dict[str, Any]]) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Convert frontend canvas components to (ui_dict, relation_dict).
        
        Args:
            canvas: List of canvas components from frontend
            
        Returns:
            (ui_dict, relation_dict) for saving to msgpack
        """
        elements = []
        scripts = []
        processed_count = 0
        
        for comp in canvas:
            comp_type = comp.get("id", "").split("-")[0]  # e.g., "text", "button"
            props = comp.get("props", {})
            
            # Map component type to msgpack element
            if comp_type == "text":
                elements.append({
                    "type": "text",
                    "value": props.get("text", "Sample Text")
                })
            elif comp_type == "heading":
                elements.append({
                    "type": "text",  # Both use text in msgpack
                    "value": props.get("text", "Heading")
                })
            elif comp_type == "button":
                action_id = None
                # Check if component has actions configured
                actions = comp.get("actions", [])
                if actions and len(actions) > 0:
                    # Check if action already has an ID (from previous save/load cycle)
                    # Extract action_id from action.id if it follows pattern "action-{action_id}"
                    existing_action_id = None
                    first_action = actions[0]
                    action_id_str = first_action.get("id", "")
                    if action_id_str.startswith("action-"):
                        existing_action_id = action_id_str.replace("action-", "")
                    
                    # Use existing action_id if valid, otherwise generate new one
                    action_id = existing_action_id if existing_action_id else short_id()
                    
                    # Convert first action to relation script
                    script = EditorConverter._action_to_script(first_action, action_id)
                    if script:
                        scripts.append(script)
                
                elements.append({
                    "type": "button",
                    "value": props.get("label", "Button"),
                    "action_id": action_id
                })
            elif comp_type == "input":
                elements.append({
                    "type": "text",  # Input not directly supported, convert to text
                    "value": props.get("placeholder", "Enter text...")
                })
            else:
                # Unknown component type - log but don't skip (could be a new type)
                # For now, skip unknown types to avoid breaking the build
                continue
            
            processed_count += 1
        
        # Ensure we processed all components (sanity check)
        if processed_count != len(canvas):
            import logging
            logging.warning(f"EditorConverter: Processed {processed_count}/{len(canvas)} components. Some may have been skipped.")
        
        # Preserve existing window config if available, otherwise use defaults
        ui_dict = {
            "page": "main",
            "window": {
                "title": "ibrahim app"  # Default, can be made configurable later
            },
            "elements": elements
        }
        
        relation_dict = {
            "scripts": scripts
        }
        
        return ui_dict, relation_dict

    @staticmethod
    def _action_to_script(action: Dict[str, Any], action_id: str) -> Dict[str, Any] | None:
        """Convert frontend action to relation script format."""
        action_type = action.get("type")
        config = action.get("config", {})
        
        if action_type == "show_alert":
            return {
                "action_id": action_id,
                "response": {
                    "type": "show_text",
                    "msg": config.get("message", "Alert!")
                }
            }
        elif action_type == "navigate":
            return {
                "action_id": action_id,
                "response": {
                    "type": "navigate",
                    "page_id": config.get("url", "")
                }
            }
        # Other action types can be mapped here
        return None

    @staticmethod
    def msgpack_to_canvas(ui_dict: Dict[str, Any], relation_dict: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Convert msgpack (ui + relation) to frontend canvas format.
        
        Args:
            ui_dict: From ui/main.msgpack
            relation_dict: From relation/main.msgpack
            
        Returns:
            List of canvas components for frontend
        """
        canvas = []
        elements = ui_dict.get("elements", [])
        scripts_by_action_id = {
            script.get("action_id"): script
            for script in relation_dict.get("scripts", [])
        }
        
        for idx, elem in enumerate(elements):
            elem_type = elem.get("type")
            value = elem.get("value", "")
            action_id = elem.get("action_id")
            
            # Determine component type and props
            comp_id = None
            props = {}
            
            if elem_type == "text":
                comp_id = "text"
                props = {"text": value}
            elif elem_type == "button":
                comp_id = "button"
                props = {"label": value}
            else:
                # Unknown type, skip
                continue
            
            if not comp_id:
                continue
            
            # Build uniqueId (ensure it's always valid)
            unique_id_parts = [comp_id, str(idx)]
            if action_id:
                unique_id_parts.append(action_id)
            uniqueId = "-".join(unique_id_parts)
            
            # Build canvas component
            comp = {
                "id": comp_id,
                "name": comp_id.capitalize(),
                "uniqueId": uniqueId,
                "x": 100 + (idx * 20),  # Default positions (can be enhanced with metadata)
                "y": 100 + (idx * 50),
                "props": props,
                "actions": []
            }
            
            # If button has action_id, convert relation script to action
            if action_id and action_id in scripts_by_action_id:
                script = scripts_by_action_id[action_id]
                response = script.get("response", {})
                action = EditorConverter._script_to_action(response, action_id)
                if action:
                    comp["actions"] = [action]
            
            canvas.append(comp)
        
        return canvas

    @staticmethod
    def _script_to_action(response: Dict[str, Any], action_id: str) -> Dict[str, Any] | None:
        """Convert relation script response to frontend action format."""
        resp_type = response.get("type")
        
        if resp_type == "show_text":
            return {
                "id": f"action-{action_id}",
                "type": "show_alert",
                "config": {
                    "message": response.get("msg", "")
                }
            }
        elif resp_type == "navigate":
            return {
                "id": f"action-{action_id}",
                "type": "navigate",
                "config": {
                    "url": response.get("page_id", "")
                }
            }
        return None
