from typing import List
from typing import Optional
import json
from datetime import datetime
import io
import google.generativeai as genai
from pydantic import BaseModel
import asyncio


class ExtractedDeadline(BaseModel):
    title: str
    description: str
    course: Optional[str] = None
    date: datetime
    priority: str


class TextProcessor:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model= genai.GenerativeModel('gemini-2.5-flash')

    async def extract_deadlines(self, document_text: str) -> List[ExtractedDeadline]:
        """
        Extract deadlines from the user-entered text to generate deadlines
        """
        document_text = document_text.strip()
        import logging
        logger = logging.getLogger(__name__)
        prompt = f"""
        Analyze the following text an extract deadlines and tasks (The text can be vague but suggestive so if you recognize a piece of text as a deadline or assignment entered by the user extract it as a deadline)
        The text can be a repetitive event. For example:
        "Create a deadline for every Tuesday at 5PM from the first of this month to the first of the next month."
        Then you are supposed to create multiple deadlines as well occuring at the time of the specified event.
        Extract all deadlines from the following text. For each deadline, return a JSON object with these fields:
        - title (string)
        - description (string)
        - course (string or null)
        - date (ISO8601 format, e.g. "2026-04-19T23:59:00")
        - priority (string: "high", "medium", "low")
        - estimated_hours (integer, estimated hours to complete, or 0 if unknown)
        Return ONLY a JSON array with fields: title, description, course, date, priority
        Example format:
        [
            {{
                "title": "Submit Project Report",
                "description": "Final project report submission for CS101",
                "course": "Computer Science 101",
                "date": "2025-10-15T23:59:00",
                "priority":"high"
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
                content = content.replace('```json','').replace('```','').strip()
            elif content.startswith('```'): 
                content = content.replace('```','').strip()
            try:
                deadlines_data = json.loads(content)
                logger.info(f"Gemini raw deadlines JSON: {deadlines_data}")
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
                    date = datetime.fromisoformat(date_str.replace('Z','+00:00'))
                    extracted.append(ExtractedDeadline(
                            title=data['title'],
                            description=data['description'],
                            course=data.get('course','General'),
                            date=date,
                            priority=data['priority'].lower()
                        ))
                except (KeyError, ValueError) as e:
                    logger.error(f"Error parsing deadline data: {data}, Error: {str(e)}")
                    continue    
            return extracted        
        except Exception as e:
            logger.error(f"Error processing the entered text: {str(e)}")
            if last_gemini_response:
                logger.error(f"Last Gemini respone: {last_gemini_response}")
            return []
