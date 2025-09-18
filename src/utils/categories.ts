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
  
  // Transport
  "uber": "Transport",
  "taxi": "Transport",
  "bus": "Transport",
  "metro": "Transport",
  "train": "Transport",
  "fuel": "Transport",
  "gas": "Transport",
  "parking": "Transport",
  
  // Technology
  "apple": "Teknologji",
  "microsoft": "Teknologji",
  "google": "Teknologji",
  "amazon": "Teknologji",
  "tech": "Teknologji",
  "software": "Teknologji",
  "computer": "Teknologji",
  "phone": "Teknologji",
  
  // Entertainment
  "playstation": "Argëtim",
  "netflix": "Argëtim",
  "spotify": "Argëtim",
  "cinema": "Argëtim",
  "theater": "Argëtim",
  "game": "Argëtim",
  "entertainment": "Argëtim",
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
    "Tjetër": "category-other",
  };
  
  return colors[category];
}

export const allCategories: ExpenseCategory[] = [
  "Ushqim",
  "Transport", 
  "Teknologji",
  "Argëtim",
  "Tjetër"
];