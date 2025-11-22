"""Local LLM wrapper package."""
from .model import LocalLLM
from .trainer import Trainer
from .prompt_templates import PROMPTS

__all__ = ["LocalLLM", "Trainer", "PROMPTS"]
