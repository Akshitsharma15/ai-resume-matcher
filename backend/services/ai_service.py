
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
  "suggestions": []
}}

Rules:
- Give at least 5 strengths
- Give at least 5 weaknesses
- Give at least 5 suggestions
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
            max_tokens=1000
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