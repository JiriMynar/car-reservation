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
import { Plus, Edit, Archive, ArchiveRestore, Car, Fuel, Users, Settings } from 'lucide-react'

const statusOptions = [
  { value: 'Aktivni', label: 'Aktivní' },
  { value: 'V udrzbe', label: 'V údržbě' },
  { value: 'Mimo provoz', label: 'Mimo provoz' }
]

const fuelTypeOptions = [
  { value: 'benzin', label: 'Benzín' },
  { value: 'nafta', label: 'Nafta' },
  { value: 'elektrina', label: 'Elektřina' },
  { value: 'hybrid', label: 'Hybrid' }
]

const transmissionOptions = [
  { value: 'manualni', label: 'Manuální' },
  { value: 'automaticka', label: 'Automatická' }
]

function VehicleForm({ vehicle, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    license_plate: '',
    color: '',
    fuel_type: '',
    seating_capacity: '',
    transmission: '',
    status: 'Aktivni',
    description: '',
    odometer: '',
    last_service_date: '',
    next_service_date: '',
    technical_inspection_expiry: '',
    highway_vignette_expiry: '',
    emission_control_expiry: '',
    notes: '',
    ...vehicle
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Značka *</Label>
          <Input
            id="make"
            value={formData.make}
            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="license_plate">SPZ *</Label>
          <Input
            id="license_plate"
            value={formData.license_plate}
            onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Barva</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuel_type">Typ paliva *</Label>
          <Select value={formData.fuel_type} onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Vyberte typ paliva" />
            </SelectTrigger>
            <SelectContent>
              {fuelTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="seating_capacity">Počet míst *</Label>
          <Input
            id="seating_capacity"
            type="number"
            min="1"
            max="50"
            value={formData.seating_capacity}
            onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="transmission">Převodovka *</Label>
          <Select value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Vyberte převodovku" />
            </SelectTrigger>
            <SelectContent>
              {transmissionOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="odometer">Stav tachometru (km)</Label>
          <Input
            id="odometer"
            type="number"
            min="0"
            value={formData.odometer}
            onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_service_date">Poslední servis</Label>
          <Input
            id="last_service_date"
            type="date"
            value={formData.last_service_date}
            onChange={(e) => setFormData({ ...formData, last_service_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="next_service_date">Příští servis</Label>
          <Input
            id="next_service_date"
            type="date"
            value={formData.next_service_date}
            onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="technical_inspection_expiry">Technická kontrola</Label>
          <Input
            id="technical_inspection_expiry"
            type="date"
            value={formData.technical_inspection_expiry}
            onChange={(e) => setFormData({ ...formData, technical_inspection_expiry: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="highway_vignette_expiry">Dálniční známka</Label>
          <Input
            id="highway_vignette_expiry"
            type="date"
            value={formData.highway_vignette_expiry}
            onChange={(e) => setFormData({ ...formData, highway_vignette_expiry: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emission_control_expiry">Emisní kontrola</Label>
          <Input
            id="emission_control_expiry"
            type="date"
            value={formData.emission_control_expiry}
            onChange={(e) => setFormData({ ...formData, emission_control_expiry: e.target.value })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Popis</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Poznámky</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Zrušit
        </Button>
        <Button type="submit">
          {vehicle ? 'Uložit změny' : 'Přidat vozidlo'}
        </Button>
      </div>
    </form>
  )
}

export default function VehicleList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    fuel_type: '',
    transmission: '',
    include_archived: false
  })

  useEffect(() => {
    fetchVehicles()
  }, [filters])

  const fetchVehicles = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/vehicles?${params}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst vozidla",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveVehicle = async (vehicleData) => {
    try {
      const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : '/api/vehicles'
      const method = editingVehicle ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(vehicleData),
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: editingVehicle ? "Vozidlo bylo aktualizováno" : "Vozidlo bylo přidáno"
        })
        setDialogOpen(false)
        setEditingVehicle(null)
        fetchVehicles()
      } else {
        const error = await response.json()
        toast({
          title: "Chyba",
          description: error.error || "Nepodařilo se uložit vozidlo",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to save vehicle:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit vozidlo",
        variant: "destructive"
      })
    }
  }

  const handleArchiveVehicle = async (vehicleId, archive = true) => {
    try {
      const endpoint = archive ? 'archive' : 'unarchive'
      const response = await fetch(`/api/vehicles/${vehicleId}/${endpoint}`, {
        method: 'PUT',
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: archive ? "Vozidlo bylo archivováno" : "Vozidlo bylo obnoveno"
        })
        fetchVehicles()
      }
    } catch (error) {
      console.error('Failed to archive/unarchive vehicle:', error)
      toast({
        title: "Chyba",
        description: "Operace se nezdařila",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'Aktivni': { label: 'Aktivní', variant: 'default' },
      'V udrzbe': { label: 'V údržbě', variant: 'secondary' },
      'Mimo provoz': { label: 'Mimo provoz', variant: 'destructive' },
      'Archivovane': { label: 'Archivované', variant: 'outline' }
    }
    const statusInfo = statusMap[status] || { label: status, variant: 'default' }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Načítání vozidel...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vozidla</h1>
          <p className="text-gray-600">Správa vozového parku</p>
        </div>
        {user?.role_name === 'Administrator' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingVehicle(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Přidat vozidlo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle ? 'Upravit vozidlo' : 'Přidat nové vozidlo'}
                </DialogTitle>
                <DialogDescription>
                  {editingVehicle ? 'Upravte informace o vozidle' : 'Vyplňte informace o novém vozidle'}
                </DialogDescription>
              </DialogHeader>
              <VehicleForm
                vehicle={editingVehicle}
                onSave={handleSaveVehicle}
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingVehicle(null)
                }}
              />
            </DialogContent>
          </Dialog>
        )}
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
              <Label>Typ paliva</Label>
              <Select value={filters.fuel_type} onValueChange={(value) => setFilters({ ...filters, fuel_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Všechny typy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Všechny typy</SelectItem>
                  {fuelTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Převodovka</Label>
              <Select value={filters.transmission} onValueChange={(value) => setFilters({ ...filters, transmission: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Všechny typy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Všechny typy</SelectItem>
                  {transmissionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant={filters.include_archived ? "default" : "outline"}
                onClick={() => setFilters({ ...filters, include_archived: !filters.include_archived })}
              >
                {filters.include_archived ? 'Skrýt archivované' : 'Zobrazit archivované'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className={vehicle.is_archived ? 'opacity-75' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <CardDescription>{vehicle.license_plate}</CardDescription>
                </div>
                {getStatusBadge(vehicle.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Fuel className="h-4 w-4 mr-2" />
                  {fuelTypeOptions.find(f => f.value === vehicle.fuel_type)?.label || vehicle.fuel_type}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {vehicle.seating_capacity} míst
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Settings className="h-4 w-4 mr-2" />
                  {transmissionOptions.find(t => t.value === vehicle.transmission)?.label || vehicle.transmission}
                </div>
                {vehicle.color && (
                  <div className="text-sm text-gray-600">
                    Barva: {vehicle.color}
                  </div>
                )}
                {vehicle.description && (
                  <div className="text-sm text-gray-600 mt-2">
                    {vehicle.description}
                  </div>
                )}
              </div>
              
              {user?.role_name === 'Administrator' && (
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingVehicle(vehicle)
                      setDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArchiveVehicle(vehicle.id, !vehicle.is_archived)}
                  >
                    {vehicle.is_archived ? (
                      <ArchiveRestore className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádná vozidla</h3>
          <p className="text-gray-600">
            {user?.role_name === 'Administrator' 
              ? 'Začněte přidáním prvního vozidla do systému.'
              : 'V systému zatím nejsou žádná vozidla.'
            }
          </p>
        </div>
      )}
    </div>
  )
}

