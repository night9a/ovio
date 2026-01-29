"""
Roller: builds action handlers (click/what-happens) from relation msgpack.
Maps action_id → Go code snippet using getters from .func.
"""

from typing import Dict, Any

from .func import get_response_to_go


class Roller:
    def __init__(self, relation: dict):
        self.relation = relation or {}
        self.handlers: Dict[str, str] = {}

    # -------------------------
    # Reader
    # -------------------------

    def read(self) -> None:
        """Parse relation['scripts'] and fill self.handlers (action_id → Go snippet)."""
        self.handlers.clear()
        for script in self.relation.get("scripts", []):
            aid = script.get("action_id")
            if not aid:
                continue
            resp = script.get("response")
            snippet = self._response_to_go(resp)
            if snippet:
                self.handlers[aid] = snippet

    def _response_to_go(self, response: Any) -> str:
        """Turn one response into Go code using getters from func."""
        if response is None:
            return ""
        if isinstance(response, str):
            response = {"type": "show_text", "msg": response}
        if not isinstance(response, dict):
            return ""
        rtype = response.get("type", "show_text")
        getter = get_response_to_go(rtype)
        if getter:
            return getter(response)
        # fallback: try show_text getter
        getter = get_response_to_go("show_text")
        return getter(response) if getter else ""

    # -------------------------
    # Public API for msg2go
    # -------------------------

    def get_handlers(self) -> Dict[str, str]:
        """Return action_id → Go snippet. Call read() first (or build())."""
        return dict(self.handlers)

    def build(self) -> Dict[str, str]:
        """Parse relation and return the action_id → snippet map."""
        self.read()
        return self.get_handlers()
