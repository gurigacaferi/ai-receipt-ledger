from typing import Dict, Optional

# Category mapping rules
CATEGORY_RULES: Dict[str, str] = {
    # Food & Groceries
    "market": "Ushqim",
    "supermarket": "Ushqim", 
    "grocery": "Ushqim",
    "restaurant": "Ushqim",
    "cafe": "Ushqim",
    "bakery": "Ushqim",
    "food": "Ushqim",
    "conad": "Ushqim",
    "lidl": "Ushqim",
    "carrefour": "Ushqim",
    
    # Transport
    "uber": "Transport",
    "taxi": "Transport",
    "bus": "Transport",
    "metro": "Transport",
    "train": "Transport",
    "fuel": "Transport",
    "gas": "Transport",
    "parking": "Transport",
    
    # Technology
    "apple": "Teknologji",
    "microsoft": "Teknologji",
    "google": "Teknologji",
    "amazon": "Teknologji",
    "tech": "Teknologji",
    "software": "Teknologji",
    "computer": "Teknologji",
    "phone": "Teknologji",
    
    # Entertainment
    "playstation": "Argëtim",
    "netflix": "Argëtim",
    "spotify": "Argëtim",
    "cinema": "Argëtim",
    "theater": "Argëtim",
    "game": "Argëtim",
    "entertainment": "Argëtim",
}

class CategorizationService:
    def __init__(self):
        self.rules = CATEGORY_RULES
        # TODO: Add persistent vendor->category mapping for learning
        self.vendor_mappings: Dict[str, str] = {}
    
    def categorize_expense(self, vendor: Optional[str] = None, description: Optional[str] = None) -> str:
        """Categorize expense based on vendor and description"""
        
        # Check persistent vendor mappings first
        if vendor and vendor.lower() in self.vendor_mappings:
            return self.vendor_mappings[vendor.lower()]
        
        # Apply rule-based categorization
        text = f"{vendor or ''} {description or ''}".lower()
        
        for keyword, category in self.rules.items():
            if keyword in text:
                return category
        
        return "Tjetër"  # Default category
    
    def add_vendor_mapping(self, vendor: str, category: str):
        """Add persistent vendor->category mapping for future learning"""
        # TODO: Persist to database
        self.vendor_mappings[vendor.lower()] = category
    
    def get_all_categories(self) -> list[str]:
        """Get all available categories"""
        categories = set(self.rules.values())
        categories.add("Tjetër")
        return sorted(list(categories))

categorization_service = CategorizationService()