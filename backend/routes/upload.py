from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import shutil

router = APIRouter()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return JSONResponse(
        content={
            "success": True,
            "filename": file.filename,
            "message": "Resume uploaded successfully"
        }
    )