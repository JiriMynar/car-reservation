import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Wrench, Car, Calendar, DollarSign } from 'lucide-react'

const serviceTypeOptions = [
  'Pravidelná údržba',
  'Výměna oleje',
  'Oprava brzd',
  'Výměna pneumatik',
  'Technická kontrola',
  'Emisní kontrola',
  'Oprava motoru',
  'Oprava převodovky',
  'Elektrické opravy',
  'Karosářské práce',
  'Ostatní'
]

function ServiceRecordForm({ record, vehicles, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_date: '',
    service_type: '',
    description: '',
    cost: '',
    service_provider: '',
    ...record
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle_id">Vozidlo *</Label>
          <Select value={formData.vehicle_id.toString()} onValueChange={(value) => setFormData({ ...formData, vehicle_id: parseInt(value) })}>
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
        <div className="space-y-2">
          <Label htmlFor="service_date">Datum servisu *</Label>
          <Input
            id="service_date"
            type="date"
            value={formData.service_date}
            onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service_type">Typ servisu *</Label>
          <Select value={formData.service_type} onValueChange={(value) => setFormData({ ...formData, service_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Vyberte typ servisu" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypeOptions.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Náklady (Kč)</Label>
          <Input
            id="cost"
            type="number"
            min="0"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="service_provider">Poskytovatel servisu</Label>
          <Input
            id="service_provider"
            value={formData.service_provider}
            onChange={(e) => setFormData({ ...formData, service_provider: e.target.value })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Popis prací *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Zrušit
        </Button>
        <Button type="submit">
          {record ? 'Uložit změny' : 'Přidat záznam'}
        </Button>
      </div>
    </form>
  )
}

export default function ServiceRecords() {
  const { toast } = useToast()
  const [records, setRecords] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [filters, setFilters] = useState({
    vehicle_id: ''
  })

  useEffect(() => {
    fetchRecords()
    fetchVehicles()
  }, [filters])

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/service-records?${params}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setRecords(data)
      }
    } catch (error) {
      console.error('Failed to fetch service records:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst servisní záznamy",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.filter(v => !v.is_archived))
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  const handleSaveRecord = async (recordData) => {
    try {
      const url = editingRecord ? `/api/service-records/${editingRecord.id}` : '/api/service-records'
      const method = editingRecord ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(recordData),
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: editingRecord ? "Servisní záznam byl aktualizován" : "Servisní záznam byl přidán"
        })
        setDialogOpen(false)
        setEditingRecord(null)
        fetchRecords()
      } else {
        const error = await response.json()
        toast({
          title: "Chyba",
          description: error.error || "Nepodařilo se uložit servisní záznam",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to save service record:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit servisní záznam",
        variant: "destructive"
      })
    }
  }

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Opravdu chcete smazat tento servisní záznam?')) return

    try {
      const response = await fetch(`/api/service-records/${recordId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: "Servisní záznam byl smazán"
        })
        fetchRecords()
      }
    } catch (error) {
      console.error('Failed to delete service record:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se smazat servisní záznam",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('cs-CZ')
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'Neuvedeno'
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Načítání servisních záznamů...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servisní záznamy</h1>
          <p className="text-gray-600">Evidence údržby a oprav vozidel</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRecord(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Přidat záznam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Upravit servisní záznam' : 'Přidat nový servisní záznam'}
              </DialogTitle>
              <DialogDescription>
                {editingRecord ? 'Upravte informace o servisu' : 'Zaznamenejte nový servisní zásah'}
              </DialogDescription>
            </DialogHeader>
            <ServiceRecordForm
              record={editingRecord}
              vehicles={vehicles}
              onSave={handleSaveRecord}
              onCancel={() => {
                setDialogOpen(false)
                setEditingRecord(null)
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vozidlo</Label>
              <Select value={filters.vehicle_id} onValueChange={(value) => setFilters({ ...filters, vehicle_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Všechna vozidla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Všechna vozidla</SelectItem>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Records List */}
      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <Wrench className="h-5 w-5 mr-2" />
                    {record.service_type}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Car className="h-4 w-4 mr-1" />
                    {record.vehicle_info}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(record.service_date)}
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(record.cost)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Popis prací:</strong>
                  <p className="text-gray-700 mt-1">{record.description}</p>
                </div>
                {record.service_provider && (
                  <div>
                    <strong>Poskytovatel servisu:</strong>
                    <span className="ml-2">{record.service_provider}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingRecord(record)
                    setDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Upravit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteRecord(record.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Smazat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {records.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné servisní záznamy</h3>
          <p className="text-gray-600">
            Začněte přidáním prvního servisního záznamu.
          </p>
        </div>
      )}
    </div>
  )
}

