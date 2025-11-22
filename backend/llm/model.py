"""Light wrapper around a local LLM or third-party client (placeholder)."""

class LocalLLM:
    def __init__(self, model_path=None):
        self.model_path = model_path

    def generate(self, prompt, max_tokens=256):
        return {"text": "This is a placeholder LLM response for: " + str(prompt)}
