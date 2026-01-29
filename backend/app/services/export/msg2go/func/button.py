"""
Button action getters: return Go code snippets for relation response types.
Each getter receives the response dict and returns the handler body (Go code).
"""

from typing import Dict, Any


def _escape_go_string(s: str) -> str:
    return str(s).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")


def show_text(response: Any) -> str:
    """response: dict with 'msg' or plain str. Sets actionMessage for UI display."""
    msg = response.get("msg", "") if isinstance(response, dict) else str(response)
    escaped = _escape_go_string(msg)
    return f'actionMessage = "{escaped}"'


def pop_msg(response: Any) -> str:
    """response: dict with 'msg'. Same as show_text for now (can be snackbar later)."""
    return show_text(response)


def navigate(response: Any) -> str:
    """response: dict with 'page_id'. Placeholder for navigation; extend as needed."""
    page_id = response.get("page_id", "") if isinstance(response, dict) else ""
    # TODO: emit Go that triggers page change when multi-page is supported
    escaped = _escape_go_string(page_id)
    return f'actionMessage = "navigate:{escaped}"'
