import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, X, Calendar, Car, User, MapPin, Clock } from 'lucide-react'

const statusOptions = [
  { value: 'Potvrzena', label: 'Potvrzená' },
  { value: 'Zrusena', label: 'Zrušená' },
  { value: 'Dokoncena', label: 'Dokončená' }
]

function ReservationForm({ reservation, onSave, onCancel }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    vehicle_id: '',
    user_id: user?.id || '',
    start_time: '',
    end_time: '',
    purpose: '',
    destination: '',
    passenger_count: 1,
    user_notes: '',
    admin_notes: '',
    status: 'Potvrzena',
    ...reservation
  })
  const [vehicles, setVehicles] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchVehicles()
    if (user?.role_name === 'Administrator') {
      fetchUsers()
    }
  }, [user])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.filter(v => !v.is_archived && v.status === 'Aktivni'))
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.filter(u => u.is_active))
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Convert datetime-local to ISO string
    const reservationData = {
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString()
    }
    
    onSave(reservationData)
  }

  // Format datetime for datetime-local input
  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toISOString().slice(0, 16)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle_id">Vozidlo *</Label>
          <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Vyberte vozidlo" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                  {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {user?.role_name === 'Administrator' && (
          <div className="space-y-2">
            <Label htmlFor="user_id">Uživatel *</Label>
            <Select value={formData.user_id.toString()} onValueChange={(value) => setFormData({ ...formData, user_id: parseInt(value) })}>
              <SelectTrigger>
                <SelectValue placeholder="Vyberte uživatele" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.full_name} ({user.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="start_time">Začátek *</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={formatDateTimeLocal(formData.start_time)}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end_time">Konec *</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={formatDateTimeLocal(formData.end_time)}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="purpose">Účel cesty *</Label>
          <Input
            id="purpose"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="destination">Cíl cesty *</Label>
          <Input
            id="destination"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="passenger_count">Počet cestujících</Label>
          <Input
            id="passenger_count"
            type="number"
            min="1"
            max="50"
            value={formData.passenger_count}
            onChange={(e) => setFormData({ ...formData, passenger_count: parseInt(e.target.value) })}
          />
        </div>
        
        {user?.role_name === 'Administrator' && reservation && (
          <div className="space-y-2">
            <Label htmlFor="status">Stav</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="user_notes">Poznámky uživatele</Label>
        <Textarea
          id="user_notes"
          value={formData.user_notes}
          onChange={(e) => setFormData({ ...formData, user_notes: e.target.value })}
          rows={3}
        />
      </div>
      
      {user?.role_name === 'Administrator' && (
        <div className="space-y-2">
          <Label htmlFor="admin_notes">Poznámky administrátora</Label>
          <Textarea
            id="admin_notes"
            value={formData.admin_notes}
            onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
            rows={3}
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Zrušit
        </Button>
        <Button type="submit">
          {reservation ? 'Uložit změny' : 'Vytvořit rezervaci'}
        </Button>
      </div>
    </form>
  )
}

export default function ReservationList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [filters, setFilters] = useState({
    vehicle_id: '',
    status: '',
    start_date: '',
    end_date: ''
  })

  useEffect(() => {
    fetchReservations()
  }, [filters])

  const fetchReservations = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/reservations?${params}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst rezervace",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReservation = async (reservationData) => {
    try {
      const url = editingReservation ? `/api/reservations/${editingReservation.id}` : '/api/reservations'
      const method = editingReservation ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reservationData),
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: editingReservation ? "Rezervace byla aktualizována" : "Rezervace byla vytvořena"
        })
        setDialogOpen(false)
        setEditingReservation(null)
        fetchReservations()
      } else {
        const error = await response.json()
        toast({
          title: "Chyba",
          description: error.error || "Nepodařilo se uložit rezervaci",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to save reservation:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit rezervaci",
        variant: "destructive"
      })
    }
  }

  const handleCancelReservation = async (reservationId) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: "Rezervace byla zrušena"
        })
        fetchReservations()
      } else {
        const error = await response.json()
        toast({
          title: "Chyba",
          description: error.error || "Nepodařilo se zrušit rezervaci",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se zrušit rezervaci",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'Potvrzena': { label: 'Potvrzená', variant: 'default' },
      'Zrusena': { label: 'Zrušená', variant: 'destructive' },
      'Dokoncena': { label: 'Dokončená', variant: 'secondary' }
    }
    const statusInfo = statusMap[status] || { label: status, variant: 'default' }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleString('cs-CZ')
  }

  const canEditReservation = (reservation) => {
    if (user?.role_name === 'Administrator') return true
    if (reservation.user_id !== user?.id) return false
    if (reservation.status !== 'Potvrzena') return false
    
    const startTime = new Date(reservation.start_time)
    const now = new Date()
    const hoursUntilStart = (startTime - now) / (1000 * 60 * 60)
    
    return hoursUntilStart >= 2
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Načítání rezervací...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rezervace</h1>
          <p className="text-gray-600">
            {user?.role_name === 'Administrator' ? 'Správa všech rezervací' : 'Vaše rezervace vozidel'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingReservation(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nová rezervace
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReservation ? 'Upravit rezervaci' : 'Nová rezervace'}
              </DialogTitle>
              <DialogDescription>
                {editingReservation ? 'Upravte detaily rezervace' : 'Vytvořte novou rezervaci vozidla'}
              </DialogDescription>
            </DialogHeader>
            <ReservationForm
              reservation={editingReservation}
              onSave={handleSaveReservation}
              onCancel={() => {
                setDialogOpen(false)
                setEditingReservation(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Stav</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Všechny stavy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Všechny stavy</SelectItem>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Od data</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Do data</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    {reservation.vehicle_info}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-1" />
                    {reservation.user_name}
                  </CardDescription>
                </div>
                {getStatusBadge(reservation.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Začátek:</span>
                    <span className="ml-2">{formatDateTime(reservation.start_time)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Konec:</span>
                    <span className="ml-2">{formatDateTime(reservation.end_time)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Cíl:</span>
                    <span className="ml-2">{reservation.destination}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Účel:</span>
                    <span className="ml-2">{reservation.purpose}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Cestující:</span>
                    <span className="ml-2">{reservation.passenger_count}</span>
                  </div>
                  {reservation.user_notes && (
                    <div className="text-sm">
                      <span className="font-medium">Poznámky:</span>
                      <span className="ml-2">{reservation.user_notes}</span>
                    </div>
                  )}
                  {reservation.admin_notes && user?.role_name === 'Administrator' && (
                    <div className="text-sm">
                      <span className="font-medium">Admin poznámky:</span>
                      <span className="ml-2">{reservation.admin_notes}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                {canEditReservation(reservation) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingReservation({
                        ...reservation,
                        start_time: reservation.start_time,
                        end_time: reservation.end_time
                      })
                      setDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Upravit
                  </Button>
                )}
                {(canEditReservation(reservation) || user?.role_name === 'Administrator') && 
                 reservation.status === 'Potvrzena' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelReservation(reservation.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Zrušit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reservations.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné rezervace</h3>
          <p className="text-gray-600">
            Zatím nemáte žádné rezervace. Vytvořte svou první rezervaci vozidla.
          </p>
        </div>
      )}
    </div>
  )
}

