import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [editingId, setEditingId] = useState(null)
  const navigate = useNavigate()

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses')
      setExpenses(response.data)
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
      }
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const resetForm = () => {
    setAmount('')
    setCategory('')
    setDescription('')
    setDate('')
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      amount: parseFloat(amount),
      category,
      description,
      date,
    }
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload)
      } else {
        await api.post('/expenses', payload)
      }
      resetForm()
      fetchExpenses()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (exp) => {
    setEditingId(exp.id)
    setAmount(exp.amount)
    setCategory(exp.category)
    setDescription(exp.description || '')
    setDate(exp.date)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`)
      if (editingId === id) resetForm()
      fetchExpenses()
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Expense Tracker</h1>
            <p className="text-slate-500 text-sm">Total spent: ${total.toFixed(2)}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit expense' : 'Add expense'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-slate-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-slate-800 transition"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
          {expenses.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No expenses yet.</p>
          )}
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {exp.category} · ${exp.amount.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">
                  {exp.date} {exp.description && `· ${exp.description}`}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(exp)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-xs font-medium text-red-500 hover:text-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard