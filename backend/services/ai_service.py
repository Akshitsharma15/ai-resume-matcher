
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import re

# Load env variables
load_dotenv()

# OpenRouter client
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

def analyze_resume(text: str):

    prompt = f"""
You are an expert ATS Resume Analyzer.

Return ONLY valid JSON.

Format:
{{
  "ats_score": number,
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
    "recommended_keywords": []
}}

Rules:
- Give at least 5 strengths
- Give at least 5 weaknesses
- do not suggest keywords that are already present in the resume and give at least 10 recommended keywords that are not present in the resume
- Give at least 5 suggestions
- Keywords should be ATS-friendly technical and professional terms
- ATS score must be between 0 and 100
- calculate ATS score based on how well the resume is optimized for ATS systems, considering factors like keyword usage, formatting, and structure.
- Do NOT write explanation outside JSON
- Return ONLY JSON

Resume:
{text}
"""

    try:

        response = client.chat.completions.create(
            model="meta-llama/llama-3-8b-instruct",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0,
            max_tokens=2000
        )

        content = response.choices[0].message.content

        print("RAW AI RESPONSE:")
        print(content)

        # REMOVE ```json ``` if present
        content = content.strip()

        content = re.sub(r"```json", "", content)
        content = re.sub(r"```", "", content)

        # FIND JSON OBJECT SAFELY
        json_match = re.search(r"\{.*\}", content, re.DOTALL)

        if not json_match:
            raise Exception("No valid JSON found in AI response")

        json_content = json_match.group()

        parsed_json = json.loads(json_content)

        return parsed_json

    except Exception as e:

        print("AI ERROR:", str(e))

        return {
            "ats_score": 0,
            "strengths": [],
            "weaknesses": [
                "AI processing failed"
            ],
            "suggestions": [
                str(e)
            ]
        }
def match_resume_to_job(resume_text: str, job_description: str):
    prompt = f"""
You are an expert ATS and job matching engine.

Compare the candidate resume with the job description.

Return ONLY valid JSON.

Required JSON format:
{{
  "match_score": number,
  "alignment_summary": "short summary",
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "recommended_keywords": ["keyword1", "keyword2"],
  "improvement_suggestions": ["suggestion1", "suggestion2"]
}}

Rules:
- match_score must be between 0 and 100
- Give at least 5 matching skills if possible
- Give at least 5 missing skills if possible
- Give at least 10 recommended keywords
- Suggestions must be practical and specific
- Do not write anything outside JSON
- Return ONLY JSON

Resume:
{resume_text}

Job Description:
{job_description}
"""

    try:
        response = client.chat.completions.create(
            model="meta-llama/llama-3-8b-instruct",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0,
            max_tokens=2000
        )

        content = response.choices[0].message.content

        print("RAW JOB MATCH RESPONSE:")
        print(content)

        content = content.strip()
        content = re.sub(r"```json", "", content)
        content = re.sub(r"```", "", content)

        json_match = re.search(r"\{.*\}", content, re.DOTALL)

        if not json_match:
            raise Exception("No valid JSON found in AI response")

        json_content = json_match.group()
        parsed_json = json.loads(json_content)

        return parsed_json

    except Exception as e:
        print("JOB MATCH AI ERROR:", str(e))

        return {
            "match_score": 0,
            "alignment_summary": "AI job matching failed.",
            "matching_skills": [],
            "missing_skills": [],
            "recommended_keywords": [],
            "improvement_suggestions": [str(e)]
        }