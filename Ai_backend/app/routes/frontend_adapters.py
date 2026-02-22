import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.pdf_service import extract_text_from_pdf
from app.core.config import settings
import json
from groq import Groq

# Initialize Groq client
groq_client = Groq(api_key=settings.GROQ_API_KEY)

router = APIRouter()
TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/process_pdf")
async def process_pdf(course_pdf: UploadFile = File(...)):
    """
    Accepts a PDF upload, extracts text, and returns a structured course outline.
    Uses Groq (Llama 3.3 70B) for inference.
    """
    if not course_pdf.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    file_path = os.path.join(TEMP_DIR, course_pdf.filename)
    try:
        # Save locally
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(course_pdf.file, buffer)
            
        # Extract text
        extracted_text = extract_text_from_pdf(file_path)
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in the PDF")
        
        print(f"Extracted {len(extracted_text)} characters from PDF")
        
        # Build prompt with document context
        document_context = extracted_text[:12000]  # Groq context window safe limit
        prompt = f"""Based on the following document content, create a structured course syllabus.

--- DOCUMENT CONTENT START ---
{document_context}
--- DOCUMENT CONTENT END ---

You must return the response STRICTLY as a JSON object with this exact schema:
{{
  "welcome_message": "A short welcoming message to the student.",
  "course_title": "The title of the course derived from the document",
  "course_content": {{
    "Chapters": {{
      "Chapter 1: Name": {{
        "Topic1": "Name of topic 1",
        "Topic2": "Name of topic 2"
      }}
    }}
  }},
  "keywords": {{
    "technical_terms": ["term1", "term2"],
    "skills": ["skill1"],
    "technologies": ["tech1"]
  }}
}}
Create 3-4 chapters, with 2-3 topics each based heavily on the text.
The course_title MUST be a meaningful title derived from the document content.
Return ONLY the JSON object, no extra text."""

        # Call Groq API
        print("Sending to Groq API (llama-3.3-70b-versatile)...")
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a course curriculum designer. Always respond with valid JSON only, no markdown formatting or code blocks."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        
        response_text = chat_completion.choices[0].message.content
        result = json.loads(response_text)
        
        print(f"Groq response: title='{result.get('course_title')}', "
              f"chapters={len(result.get('course_content', {}).get('Chapters', {}))}")
        return result

    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"Raw response: {response_text}")
        raise HTTPException(status_code=500, detail="LLM returned invalid JSON")
    except Exception as e:
        print(f"Error in process_pdf: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/upload_and_process2")
async def upload_and_process2(
    file: UploadFile = File(...),
    course_id: str = Form(...),
    user_id: str = Form(...)
):
    """
    Endpoint to handle the textbook upload for processing.
    """
    return {
        "status": "success",
        "message": f"Upload process started for course {course_id}",
        "data": {
            "course_id": course_id,
            "filename": file.filename
        }
    }


@router.post("/recommendation")
async def get_recommendation(
    user_id: str = Form(...),
    article_id: str = Form(...)
):
    """
    Returns recommended article IDs.
    """
    return {
        "data": [
            "123e4567-e89b-12d3-a456-426614174000",
            "123e4567-e89b-12d3-a456-426614174001", 
            "123e4567-e89b-12d3-a456-426614174002"
        ]
    }
