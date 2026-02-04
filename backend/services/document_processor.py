from typing import List
import google.generativeai as genai
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
import json
import asyncio
import io
from PyPDF2 import PdfReader

class ExtractedDeadline(BaseModel):
    title: str
    description: str
    course: Optional[str] = None
    date: datetime
    priority: str

class DocumentProcessor:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def extract_text_from_pdf(self, pdf_content: bytes) -> str:
        """
        Extract text content from PDF bytes
        """
        try:
            pdf_file = io.BytesIO(pdf_content)
            pdf_reader = PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    async def extract_deadlines(self, document_text: str) -> List[ExtractedDeadline]:
        """
        Extract deadlines from document text using Gemini API
        """
        import logging
        logger = logging.getLogger(__name__)
        prompt = f"""
        Analyze the following text and extract all deadlines and tasks (Make sure they are genuine deadlines or assignments). For each one, provide:
        1. A clear title
        2. Detailed description
        3. Course/subject name (if identifiable from context, otherwise "General")
        4. Due date (format as ISO datetime: YYYY-MM-DDTHH:MM:SS)
        5. Priority level (high/medium/low) based on urgency and importance
        Return ONLY a JSON array with fields: title, description, course, date, priority
        Example format:
        [
            {{
                "title": "Submit Project Report",
                "description": "Final project report submission for CS101",
                "course": "Computer Science 101",
                "date": "2025-10-15T23:59:00",
                "priority": "high"
            }}
        ]
        Text to analyze:
        {document_text}
        """
        last_gemini_response = None
        try:
            def generate_content():
                response = self.model.generate_content(prompt)
                return response.text
            loop = asyncio.get_event_loop()
            content = await loop.run_in_executor(None, generate_content)
            last_gemini_response = content
            content = content.strip()
            if content.startswith('```json'):
                content = content.replace('```json', '').replace('```', '').strip()
            elif content.startswith('```'):
                content = content.replace('```', '').strip()
            try:
                deadlines_data = json.loads(content)
            except Exception as json_err:
                logger.error(f"Gemini API returned invalid JSON: {content}")
                logger.error(f"JSON parsing error: {json_err}")
                return []
            extracted = []
            for data in deadlines_data:
                try:
                    date_str = data['date']
                    if 'T' not in date_str:
                        date_str += 'T23:59:00'
                    date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    extracted.append(ExtractedDeadline(
                        title=data['title'],
                        description=data['description'],
                        course=data.get('course', 'General'),
                        date=date,
                        priority=data['priority'].lower()
                    ))
                except (KeyError, ValueError) as e:
                    logger.error(f"Error parsing deadline data: {data}, Error: {str(e)}")
                    continue
            return extracted
        except Exception as e:
            logger.error(f"Error processing document with Gemini API: {str(e)}")
            if last_gemini_response:
                logger.error(f"Last Gemini response: {last_gemini_response}")
            return []