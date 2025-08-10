import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, AlertTriangle, Car, Calendar, DollarSign } from 'lucide-react'

const repairStatusOptions = [
  { value: 'Ceka na opravu', label: 'Čeká na opravu' },
  { value: 'Opraveno', label: 'Opraveno' },
  { value: 'Neopravitelne', label: 'Neopravitelné' }
]

function DamageRecordForm({ record, vehicles, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    damage_date: '',
    description: '',
    estimated_cost: '',
    actual_cost: '',
    repair_status: 'Ceka na opravu',
    photos: [],
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
          <Label htmlFor="damage_date">Datum poškození *</Label>
          <Input
            id="damage_date"
            type="date"
            value={formData.damage_date}
            onChange={(e) => setFormData({ ...formData, damage_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimated_cost">Odhadované náklady (Kč)</Label>
          <Input
            id="estimated_cost"
            type="number"
            min="0"
            step="0.01"
            value={formData.estimated_cost}
            onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="actual_cost">Skutečné náklady (Kč)</Label>
          <Input
            id="actual_cost"
            type="number"
            min="0"
            step="0.01"
            value={formData.actual_cost}
            onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="repair_status">Stav opravy</Label>
          <Select value={formData.repair_status} onValueChange={(value) => setFormData({ ...formData, repair_status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {repairStatusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Popis poškození *</Label>
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

export default function DamageRecords() {
  const { toast } = useToast()
  const [records, setRecords] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [filters, setFilters] = useState({
    vehicle_id: '',
    repair_status: ''
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

      const response = await fetch(`/api/damage-records?${params}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setRecords(data)
      }
    } catch (error) {
      console.error('Failed to fetch damage records:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst záznamy o poškození",
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
      const url = editingRecord ? `/api/damage-records/${editingRecord.id}` : '/api/damage-records'
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
          description: editingRecord ? "Záznam o poškození byl aktualizován" : "Záznam o poškození byl přidán"
        })
        setDialogOpen(false)
        setEditingRecord(null)
        fetchRecords()
      } else {
        const error = await response.json()
        toast({
          title: "Chyba",
          description: error.error || "Nepodařilo se uložit záznam o poškození",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to save damage record:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit záznam o poškození",
        variant: "destructive"
      })
    }
  }

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Opravdu chcete smazat tento záznam o poškození?')) return

    try {
      const response = await fetch(`/api/damage-records/${recordId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: "Záznam o poškození byl smazán"
        })
        fetchRecords()
      }
    } catch (error) {
      console.error('Failed to delete damage record:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se smazat záznam o poškození",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'Ceka na opravu': { label: 'Čeká na opravu', variant: 'destructive' },
      'Opraveno': { label: 'Opraveno', variant: 'default' },
      'Neopravitelne': { label: 'Neopravitelné', variant: 'secondary' }
    }
    const statusInfo = statusMap[status] || { label: status, variant: 'default' }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
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
    return <div className="flex items-center justify-center h-64">Načítání záznamů o poškození...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Záznamy o poškození</h1>
          <p className="text-gray-600">Evidence poškození vozidel a jejich oprav</p>
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
                {editingRecord ? 'Upravit záznam o poškození' : 'Přidat nový záznam o poškození'}
              </DialogTitle>
              <DialogDescription>
                {editingRecord ? 'Upravte informace o poškození' : 'Zaznamenejte nové poškození vozidla'}
              </DialogDescription>
            </DialogHeader>
            <DamageRecordForm
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
            <div className="space-y-2">
              <Label>Stav opravy</Label>
              <Select value={filters.repair_status} onValueChange={(value) => setFilters({ ...filters, repair_status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Všechny stavy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Všechny stavy</SelectItem>
                  {repairStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Damage Records List */}
      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Poškození vozidla
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Car className="h-4 w-4 mr-1" />
                    {record.vehicle_info}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(record.repair_status)}
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(record.damage_date)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <strong>Popis poškození:</strong>
                  <p className="text-gray-700 mt-1">{record.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Odhadované náklady:</strong>
                    <div className="flex items-center mt-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(record.estimated_cost)}
                    </div>
                  </div>
                  <div>
                    <strong>Skutečné náklady:</strong>
                    <div className="flex items-center mt-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(record.actual_cost)}
                    </div>
                  </div>
                </div>
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
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné záznamy o poškození</h3>
          <p className="text-gray-600">
            Zatím nejsou evidována žádná poškození vozidel.
          </p>
        </div>
      )}
    </div>
  )
}

