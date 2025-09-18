'use client'

import { useState, useEffect } from 'react'

interface Expense {
  id: string
  date: string
  vendor?: string
  description?: string
  category: string
  amount: number
  currency: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    category: ''
  })

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.from) params.append('from', filters.from)
      if (filters.to) params.append('to', filters.to)
      if (filters.category) params.append('cat', filters.category)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/expenses/?${params}`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.from) params.append('from', filters.from)
      if (filters.to) params.append('to', filters.to)
      if (filters.category) params.append('cat', filters.category)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/exports/expenses.csv?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'expenses.csv'
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export CSV:', error)
    }
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shpenzimet</h1>
          <p className="text-gray-600">Manage and track your expenses</p>
        </div>
        <button onClick={exportCSV} className="btn btn-outline">
          📥 Export CSV
        </button>
      </div>

      <div className="filter-section">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Expenses</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.from}
              onChange={(e) => handleFilterChange('from', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.to}
              onChange={(e) => handleFilterChange('to', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Ushqim">Ushqim</option>
              <option value="Transport">Transport</option>
              <option value="Teknologji">Teknologji</option>
              <option value="Argëtim">Argëtim</option>
              <option value="Tjetër">Tjetër</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Total</label>
            <div className="text-lg font-semibold text-gray-900">
              €{totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading expenses...</div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              No expenses found. Upload some receipts to get started!
            </div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>{expense.vendor || '-'}</td>
                  <td>{expense.description || '-'}</td>
                  <td>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="font-medium">
                    {expense.currency} {expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}