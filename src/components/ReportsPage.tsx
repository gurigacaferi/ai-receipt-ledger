import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, MonthlyReport } from "@/types/expense";
import { getCategoryColor, allCategories } from "@/utils/categories";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Mock data for development 
const mockExpenses: Expense[] = [
  { id: "1", user_id: "user1", date: "2024-01-15", category: "Ushqim", description: "Grocery shopping", amount: 45.50, currency: "EUR", vendor: "Conad" },
  { id: "2", user_id: "user1", date: "2024-01-14", category: "Transport", description: "Taxi ride", amount: 12.30, currency: "EUR", vendor: "Uber" },
  { id: "3", user_id: "user1", date: "2024-01-13", category: "Teknologji", description: "Software subscription", amount: 29.99, currency: "EUR", vendor: "Microsoft" },
  { id: "4", user_id: "user1", date: "2024-01-12", category: "Argëtim", description: "Movie tickets", amount: 18.00, currency: "EUR", vendor: "Cinema" },
  { id: "5", user_id: "user1", date: "2024-02-10", category: "Ushqim", description: "Restaurant", amount: 32.00, currency: "EUR", vendor: "Pizza Place" },
  { id: "6", user_id: "user1", date: "2024-02-08", category: "Transport", description: "Bus ticket", amount: 2.50, currency: "EUR", vendor: "City Transport" },
  { id: "7", user_id: "user1", date: "2024-03-05", category: "Teknologji", description: "Phone accessories", amount: 25.00, currency: "EUR", vendor: "Tech Store" },
];

const ReportsPage = () => {
  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, { total: number; categories: Record<string, number> }>();
    
    mockExpenses.forEach(expense => {
      const monthKey = expense.date.substring(0, 7); // YYYY-MM format
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { 
          total: 0, 
          categories: Object.fromEntries(allCategories.map(cat => [cat, 0]))
        });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      monthData.total += expense.amount;
      monthData.categories[expense.category] += expense.amount;
    });
    
    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, []);

  const categoryTotals = useMemo(() => {
    const totals = Object.fromEntries(allCategories.map(cat => [cat, 0]));
    
    mockExpenses.forEach(expense => {
      totals[expense.category] += expense.amount;
    });
    
    return totals;
  }, []);

  const monthlyChartData = {
    labels: monthlyData.map(data => {
      const date = new Date(data.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Total Expenses',
        data: monthlyData.map(data => data.total),
        backgroundColor: 'hsl(var(--primary))',
        borderColor: 'hsl(var(--primary-light))',
        borderWidth: 1,
      },
    ],
  };

  const categoryChartData = {
    labels: allCategories,
    datasets: [
      {
        data: allCategories.map(category => categoryTotals[category]),
        backgroundColor: [
          'hsl(var(--category-food))',
          'hsl(var(--category-transport))',
          'hsl(var(--category-tech))',
          'hsl(var(--category-entertainment))',
          'hsl(var(--category-other))',
        ],
        borderWidth: 2,
        borderColor: 'hsl(var(--background))',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '€' + value.toFixed(0);
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: €${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
  };

  const totalSpent = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averagePerMonth = monthlyData.length > 0 ? totalSpent / monthlyData.length : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Raporte</h1>
        <p className="text-muted-foreground">
          Analyze your spending patterns and trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              €{totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              €{averagePerMonth.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {mockExpenses.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total expenses recorded
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending</CardTitle>
            <CardDescription>
              Track your spending trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Bar data={monthlyChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              See how your money is distributed across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut data={categoryChartData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>
            Detailed spending by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allCategories.map(category => {
              const amount = categoryTotals[category];
              const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`w-4 h-4 rounded-full bg-${getCategoryColor(category)}`}
                    />
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">€{amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;