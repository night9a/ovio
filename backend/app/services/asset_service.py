"""Asset upload/download logic (placeholder)."""

class AssetService:
    def save_asset(self, file_storage):
        return {"id": None, "filename": getattr(file_storage, "filename", None)}
