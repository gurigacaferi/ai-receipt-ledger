import os
import json
from typing import Optional
from openai import OpenAI
from pydantic import ValidationError

from app.schemas import ParsedReceipt
from app.services.categorization import categorization_service

class AIParserService:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
        )
        self.model = os.getenv("OPENAI_MODEL_VISION", "gpt-4o-mini")
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.1"))
    
    async def parse_receipt(self, image_url: str) -> ParsedReceipt:
        """Parse receipt image using OpenAI Vision API"""
        
        system_prompt = """Ti je një parser faturash. Kthe JSON strikt sipas skemës më poshtë. Mos shto tekst tjetër.
Schema:
{
  "vendor": "string",
  "invoice_no": "string|null",
  "invoice_date": "YYYY-MM-DD",
  "currency": "ISO 4217",
  "items": [
    {"description":"string","qty":1,"unit_price":0.0,"line_total":0.0,"category":"auto"}
  ],
  "subtotal": 0.0,
  "tax": 0.0,
  "total": 0.0,
  "guessed_categories": true
}"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Lexo faturën dhe kthe JSON"},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }
                ],
                response_format={"type": "json_object"},
                temperature=self.temperature,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            parsed_data = json.loads(content)
            
            # Auto-categorize items if needed
            if "items" in parsed_data:
                for item in parsed_data["items"]:
                    if item.get("category") == "auto":
                        item["category"] = categorization_service.categorize_expense(
                            vendor=parsed_data.get("vendor"),
                            description=item.get("description")
                        )
            
            # Validate against Pydantic schema
            return ParsedReceipt(**parsed_data)
            
        except ValidationError as e:
            raise ValueError(f"Invalid receipt data format: {e}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON response from AI: {e}")
        except Exception as e:
            raise ValueError(f"AI parsing failed: {e}")

# TODO: Option B - OCR + LLM pipeline
class OCRParserService:
    """
    TODO: Option B implementation
    1. Use OCR provider (Tesseract/Cloud Vision/Textract) to extract raw text
    2. Clean and normalize the text
    3. Use LLM to structure the normalized text into JSON
    4. This approach may be more cost-effective for high volume
    """
    pass

ai_parser_service = AIParserService()