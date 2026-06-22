import Link from 'next/link'

export default function Home() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">F-to-A Tutoring CRM</h1>
        <p className="text-xl text-gray-600">
          Manage your students, schedule sessions, and track progress all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/students">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">👥</h2>
            <h3 className="text-xl font-semibold mb-2">Students</h3>
            <p className="text-gray-600">Manage student profiles and contact information</p>
          </div>
        </Link>

        <Link href="/sessions">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-2xl font-bold text-green-600 mb-2">📅</h2>
            <h3 className="text-xl font-semibold mb-2">Sessions</h3>
            <p className="text-gray-600">Schedule and track tutoring sessions</p>
          </div>
        </Link>

        <Link href="/billing">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-2xl font-bold text-purple-600 mb-2">💰</h2>
            <h3 className="text-xl font-semibold mb-2">Billing</h3>
            <p className="text-gray-600">Track payments and invoices</p>
          </div>
        </Link>

        <Link href="/dashboard">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-2xl font-bold text-orange-600 mb-2">📊</h2>
            <h3 className="text-xl font-semibold mb-2">Dashboard</h3>
            <p className="text-gray-600">View business metrics and reports</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
