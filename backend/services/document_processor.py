from typing import List
import openai
from pydantic import BaseModel
from datetime import datetime

class ExtractedDeadline(BaseModel):
    title: str
    description: str
    date: datetime
    priority: str

class DocumentProcessor:
    def __init__(self, api_key: str):
        openai.api_key = api_key
    
    async def extract_deadlines(self, document_text: str) -> List[ExtractedDeadline]:
        """
        Extract deadlines from document text using LLM
        """
        prompt = f"""
        Analyze the following text and extract all deadlines and tasks. For each one, provide:
        1. A clear title
        2. Detailed description
        3. Due date
        4. Priority level (high/medium/low) based on urgency and importance
        
        Format as JSON array with fields: title, description, date, priority

        Text to analyze:
        {document_text}
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that extracts deadline information from text and returns it in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            # Parse the JSON response and create ExtractedDeadline objects
            import json
            from datetime import datetime
            
            content = response.choices[0].message.content
            deadlines_data = json.loads(content)
            
            extracted = []
            for data in deadlines_data:
                # Convert string date to datetime
                date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
                extracted.append(ExtractedDeadline(
                    title=data['title'],
                    description=data['description'],
                    date=date,
                    priority=data['priority'].lower()
                ))
            
            return extracted
            
        except Exception as e:
            print(f"Error processing document: {str(e)}")
            return []