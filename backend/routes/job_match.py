from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os

from services.pdf_service import extract_text_from_pdf
from services.ai_service import match_resume_to_job

router = APIRouter()

@router.post("/match-job")
async def match_job_profile(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    os.makedirs("uploads", exist_ok=True)

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text = extract_text_from_pdf(file_path)

    match_result = match_resume_to_job(
        resume_text=resume_text,
        job_description=job_description
    )

    return {
        "message": "Job profile matched successfully",
        "resume_preview": resume_text[:500],
        "match_result": match_result
    }