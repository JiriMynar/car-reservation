import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, Users, Calendar, Wrench, AlertTriangle, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Načítání dashboard...</div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Chyba při načítání dat</div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Aktivní vozidla',
      value: dashboardData.total_active_vehicles,
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Aktivní uživatelé',
      value: dashboardData.total_active_users,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Rezervace tento měsíc',
      value: dashboardData.monthly_reservations,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Probíhající cesty',
      value: dashboardData.active_reservations,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      name: 'Vozidla v údržbě',
      value: dashboardData.vehicles_in_maintenance,
      icon: Wrench,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Nevyřízená poškození',
      value: dashboardData.unresolved_damages,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Přehled vozového parku</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reservation Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trend rezervací</CardTitle>
          <CardDescription>
            Počet rezervací za posledních 6 měsíců
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.reservation_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

