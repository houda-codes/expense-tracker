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

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <h3>Your Expenses</h3>
      <ul>
        {expenses.map((exp) => (
          <li key={exp.id}>
            {exp.date} — {exp.category} — ${exp.amount} — {exp.description}
            <button onClick={() => handleEdit(exp)}>Edit</button>
            <button onClick={() => handleDelete(exp.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Dashboard