import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Download, BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function Reports() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  })
  
  const [vehicleUtilization, setVehicleUtilization] = useState([])
  const [costAnalysis, setCostAnalysis] = useState(null)
  const [reservationStats, setReservationStats] = useState(null)

  useEffect(() => {
    fetchAllReports()
  }, [])

  const fetchAllReports = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchVehicleUtilization(),
        fetchCostAnalysis(),
        fetchReservationStats()
      ])
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleUtilization = async () => {
    try {
      const params = new URLSearchParams(dateRange)
      const response = await fetch(`/api/vehicle-utilization?${params}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setVehicleUtilization(data)
      }
    } catch (error) {
      console.error('Failed to fetch vehicle utilization:', error)
    }
  }

  const fetchCostAnalysis = async () => {
    try {
      const params = new URLSearchParams(dateRange)
      const response = await fetch(`/api/cost-analysis?${params}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setCostAnalysis(data)
      }
    } catch (error) {
      console.error('Failed to fetch cost analysis:', error)
    }
  }

  const fetchReservationStats = async () => {
    try {
      const params = new URLSearchParams(dateRange)
      const response = await fetch(`/api/reservation-statistics?${params}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setReservationStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch reservation statistics:', error)
    }
  }

  const handleDateRangeChange = () => {
    fetchAllReports()
  }

  const handleExport = async (reportType) => {
    try {
      const params = new URLSearchParams(dateRange)
      const response = await fetch(`/api/export/${reportType}?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${reportType}_${dateRange.start_date}_${dateRange.end_date}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Úspěch",
          description: "Report byl exportován"
        })
      }
    } catch (error) {
      console.error('Failed to export report:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se exportovat report",
        variant: "destructive"
      })
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Načítání reportů...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reporty a analýzy</h1>
        <p className="text-gray-600">Detailní přehledy o provozu vozového parku</p>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Časové období</CardTitle>
          <CardDescription>Vyberte období pro analýzu dat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Od</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Do</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              />
            </div>
            <Button onClick={handleDateRangeChange}>
              Aktualizovat
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="utilization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="utilization">Využití vozidel</TabsTrigger>
          <TabsTrigger value="costs">Analýza nákladů</TabsTrigger>
          <TabsTrigger value="reservations">Statistiky rezervací</TabsTrigger>
        </TabsList>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Využití vozidel
                </CardTitle>
                <CardDescription>
                  Analýza využití jednotlivých vozidel v daném období
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('vehicle-utilization')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {vehicleUtilization.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vehicleUtilization}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="vehicle_info" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="utilization_percentage" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicleUtilization.slice(0, 6).map((vehicle, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium">{vehicle.vehicle_info}</h4>
                        <div className="mt-2 space-y-1">
                          <div className="text-sm text-gray-600">
                            Využití: {vehicle.utilization_percentage}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Rezervováno: {vehicle.total_reserved_hours}h
                          </div>
                          <div className="text-sm text-gray-600">
                            Počet rezervací: {vehicle.reservation_count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Žádná data pro vybrané období</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Analýza nákladů
                </CardTitle>
                <CardDescription>
                  Přehled nákladů na provoz vozidel
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('cost-analysis')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {costAnalysis ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(costAnalysis.summary.total_service_costs)}
                        </div>
                        <p className="text-sm text-gray-600">Servisní náklady</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(costAnalysis.summary.total_damage_costs)}
                        </div>
                        <p className="text-sm text-gray-600">Náklady na opravy</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(costAnalysis.summary.grand_total)}
                        </div>
                        <p className="text-sm text-gray-600">Celkové náklady</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Vehicle Costs Chart */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costAnalysis.vehicles.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="vehicle_info" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="service_costs" stackId="a" fill="#8884d8" name="Servis" />
                        <Bar dataKey="damage_costs" stackId="a" fill="#82ca9d" name="Opravy" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Žádná data pro vybrané období</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Statistiky rezervací
                </CardTitle>
                <CardDescription>
                  Analýza rezervací a jejich využití
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('reservation-statistics')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {reservationStats ? (
                <div className="space-y-6">
                  {/* Status Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Rozdělení podle stavu</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reservationStats.status_breakdown}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ status, count }) => `${status}: ${count}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {reservationStats.status_breakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Nejaktivnější uživatelé</h3>
                      <div className="space-y-2">
                        {reservationStats.top_users.slice(0, 5).map((user, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{user.user_name}</span>
                            <span className="text-sm text-gray-600">{user.reservation_count} rezervací</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Vehicles */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Nejoblíbenější vozidla</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reservationStats.top_vehicles.slice(0, 6).map((vehicle, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium">{vehicle.vehicle_info}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {vehicle.reservation_count} rezervací
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Daily Overview */}
                  {reservationStats.daily_overview.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Denní přehled</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reservationStats.daily_overview}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Žádná data pro vybrané období</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

