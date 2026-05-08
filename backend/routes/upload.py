from fastapi import APIRouter, UploadFile, File
import shutil

from services.pdf_service import extract_text_from_pdf
from services.ai_service import analyze_resume

router = APIRouter()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    print("UPLOAD HIT")

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # STEP 1: extract text
    extracted_text = extract_text_from_pdf(file_path)

    print("TEXT EXTRACTED")

    # STEP 2: AI CALL (THIS WAS MISSING OR NOT WORKING)
    ai_result = analyze_resume(extracted_text)

    print("AI DONE")

    # STEP 3: return EVERYTHING
    return {
        "message": "Resume analyzed successfully",
        "text": extracted_text,
        "analysis": ai_result
    }