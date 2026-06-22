'use client'

import { useEffect, useState } from 'react'

interface Payment {
  id: number
  student_id: number
  amount: number
  date: string
  description: string
  status: string
}

interface Student {
  id: number
  name: string
}

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'paid',
  })

  useEffect(() => {
    const fetchData = async () => {
      const [paymentsRes, studentsRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/students'),
      ])
      const paymentsData = await paymentsRes.json()
      const studentsData = await studentsRes.json()
      setPayments(paymentsData)
      setStudents(studentsData)
      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        student_id: parseInt(formData.student_id),
        amount: parseFloat(formData.amount),
      }),
    })

    if (res.ok) {
      setFormData({
        student_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'paid',
      })
      setShowForm(false)
      const paymentsRes = await fetch('/api/payments')
      setPayments(await paymentsRes.json())
    }
  }

  const getStudentName = (studentId: number) => {
    return students.find(s => s.id === studentId)?.name || 'Unknown'
  }

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const studentPaymentMap: Record<number, number> = {}
  payments.forEach(p => {
    studentPaymentMap[p.student_id] = (studentPaymentMap[p.student_id] || 0) + p.amount
  })

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Billing</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Record Payment'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">{students.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold text-purple-600">{payments.length}</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                required
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="border px-3 py-2 rounded"
              >
                <option value="">Select Student *</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Amount *"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="border px-3 py-2 rounded"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border px-3 py-2 rounded w-full"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Record Payment
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left">Student</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{getStudentName(payment.student_id)}</td>
                  <td className="px-6 py-4 font-semibold">${payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{payment.date}</td>
                  <td className="px-6 py-4">{payment.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-sm ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
