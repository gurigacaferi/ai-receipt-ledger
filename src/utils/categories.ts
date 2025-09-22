import { ExpenseCategory } from "@/types/expense";

// Category mapping rules
const categoryRules: Record<string, ExpenseCategory> = {
  // Food & Groceries
  "market": "Ushqim",
  "supermarket": "Ushqim",
  "grocery": "Ushqim",
  "restaurant": "Ushqim",
  "cafe": "Ushqim",
  "bakery": "Ushqim",
  "food": "Ushqim",
  "bread": "Ushqim",
  "milk": "Ushqim",
  "meat": "Ushqim",
  "fruit": "Ushqim",
  "vegetable": "Ushqim",
  "drink": "Ushqim",
  "water": "Ushqim",
  "coffee": "Ushqim",
  "pizza": "Ushqim",
  "conad": "Ushqim",
  "lidl": "Ushqim",
  "carrefour": "Ushqim",
  
  // Transport
  "uber": "Transport",
  "taxi": "Transport",
  "bus": "Transport",
  "metro": "Transport",
  "train": "Transport",
  "fuel": "Transport",
  "gas": "Transport",
  "parking": "Transport",
  "petrol": "Transport",
  "station": "Transport",
  "ticket": "Transport",
  "flight": "Transport",
  "airline": "Transport",
  
  // Technology
  "apple": "Teknologji",
  "microsoft": "Teknologji",
  "google": "Teknologji",
  "amazon": "Teknologji",
  "tech": "Teknologji",
  "software": "Teknologji",
  "computer": "Teknologji",
  "phone": "Teknologji",
  "laptop": "Teknologji",
  "tablet": "Teknologji",
  "electronics": "Teknologji",
  
  // Entertainment
  "playstation": "Argëtim",
  "netflix": "Argëtim",
  "spotify": "Argëtim",
  "cinema": "Argëtim",
  "theater": "Argëtim",
  "game": "Argëtim",
  "entertainment": "Argëtim",
  "xbox": "Argëtim",
  "concert": "Argëtim",
  "sport": "Argëtim",
  "movie": "Argëtim",
  "music": "Argëtim",
  "book": "Argëtim",
  "magazine": "Argëtim",
};

export function categorizeExpense(vendor?: string, description?: string): ExpenseCategory {
  const text = `${vendor || ""} ${description || ""}`.toLowerCase();
  
  for (const [keyword, category] of Object.entries(categoryRules)) {
    if (text.includes(keyword)) {
      return category;
    }
  }
  
  return "Tjetër";
}

export function getCategoryColor(category: ExpenseCategory): string {
  const colors: Record<ExpenseCategory, string> = {
    "Ushqim": "category-food",
    "Transport": "category-transport", 
    "Teknologji": "category-tech",
    "Argëtim": "category-entertainment",
    "Shëndetësi": "category-health",
    "Veshmbathje": "category-clothing",
    "Tjetër": "category-other",
  };
  
  return colors[category];
}

export const allCategories: ExpenseCategory[] = [
  "Ushqim",
  "Transport", 
  "Teknologji",
  "Argëtim",
  "Shëndetësi",
  "Veshmbathje",
  "Tjetër"
];