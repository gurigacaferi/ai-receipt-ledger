'use client'

import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface MonthlyReport {
  month: string
  categories: Record<string, number>
  total: number
}

export default function ReportsPage() {
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/reports/monthly`)
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    labels: reports.map(report => {
      const [year, month] = report.month.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }),
    datasets: [
      {
        label: 'Total Spending',
        data: reports.map(report => report.total),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Spending Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '€' + value.toFixed(0)
          }
        }
      }
    }
  }

  const totalSpent = reports.reduce((sum, report) => sum + report.total, 0)
  const averageMonthly = reports.length > 0 ? totalSpent / reports.length : 0

  // Calculate category totals
  const categoryTotals: Record<string, number> = {}
  reports.forEach(report => {
    Object.entries(report.categories).forEach(([category, amount]) => {
      categoryTotals[category] = (categoryTotals[category] || 0) + amount
    })
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Raporte</h1>
        <p className="text-gray-600">Analyze your spending patterns and trends</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading reports...</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">
            No data available. Upload some receipts to see reports!
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
              <div className="text-2xl font-bold text-gray-900">
                €{totalSpent.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Across all categories</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">Monthly Average</h3>
              <div className="text-2xl font-bold text-gray-900">
                €{averageMonthly.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Per month</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
              <div className="text-2xl font-bold text-gray-900">
                {reports.reduce((sum, report) => 
                  sum + Object.values(report.categories).filter(amount => amount > 0).length, 0
                )}
              </div>
              <p className="text-xs text-gray-500">Total expenses recorded</p>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Monthly Spending Trends
            </h2>
            <div className="chart-container">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Category Breakdown
            </h2>
            <div className="space-y-4">
              {Object.entries(categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">{category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">€{amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}