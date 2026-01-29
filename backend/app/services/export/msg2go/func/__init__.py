"""
Func: getters for relation response types.
Maps response["type"] → callable(response) that returns Go code snippet.
"""

from typing import Dict, Callable, Any

from . import button

# Registry: response type name -> getter(response) -> str
FUNC_REGISTRY: Dict[str, Callable[[Any], str]] = {
    "show_text": button.show_text,
    "pop_msg": button.pop_msg,
    "navigate": button.navigate,
}


def get_response_to_go(response_type: str):
    """Return the getter for this response type, or None."""
    return FUNC_REGISTRY.get(response_type)
