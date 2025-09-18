import { useState, useMemo } from "react";
import { Search, Download, Filter, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Expense, ExpenseCategory } from "@/types/expense";
import { getCategoryColor, allCategories } from "@/utils/categories";
import { cn } from "@/lib/utils";

// Mock data for development
const mockExpenses: Expense[] = [
  {
    id: "1",
    user_id: "user1",
    date: "2024-01-15",
    category: "Ushqim",
    description: "Grocery shopping",
    amount: 45.50,
    currency: "EUR",
    vendor: "Conad"
  },
  {
    id: "2", 
    user_id: "user1",
    date: "2024-01-14",
    category: "Transport",
    description: "Taxi ride",
    amount: 12.30,
    currency: "EUR",
    vendor: "Uber"
  },
  {
    id: "3",
    user_id: "user1", 
    date: "2024-01-13",
    category: "Teknologji",
    description: "Software subscription",
    amount: 29.99,
    currency: "EUR",
    vendor: "Microsoft"
  },
  {
    id: "4",
    user_id: "user1",
    date: "2024-01-12", 
    category: "Argëtim",
    description: "Movie tickets",
    amount: 18.00,
    currency: "EUR",
    vendor: "Cinema"
  }
];

const ExpensesPage = () => {
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = !searchTerm || 
        expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory;
      
      const matchesDateFrom = !dateFrom || expense.date >= dateFrom;
      const matchesDateTo = !dateTo || expense.date <= dateTo;
      
      return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    });
  }, [expenses, searchTerm, selectedCategory, dateFrom, dateTo]);

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const exportToCSV = () => {
    const headers = ["Date", "Vendor", "Description", "Category", "Amount", "Currency"];
    const rows = filteredExpenses.map(expense => [
      expense.date,
      expense.vendor || "",
      expense.description || "",
      expense.category,
      expense.amount.toFixed(2),
      expense.currency
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shpenzimet</h1>
          <p className="text-muted-foreground">
            Manage and track your expenses
          </p>
        </div>
        
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Expenses</CardTitle>
          <CardDescription>
            Use the filters below to find specific expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendor or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              placeholder="From date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px]"
            />
            
            <Input
              type="date" 
              placeholder="To date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
            />
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {filteredExpenses.length} expenses found
            </span>
            <span className="text-lg font-semibold">
              Total: €{totalAmount.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "text-white",
                        `bg-${getCategoryColor(expense.category as ExpenseCategory)}`
                      )}
                    >
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {expense.currency} {expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No expenses found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesPage;