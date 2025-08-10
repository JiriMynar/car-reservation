import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, UserX, UserCheck, Users, Mail, Phone, Building } from 'lucide-react'

function UserForm({ user, roles, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    corporate_id: '',
    department: '',
    phone: '',
    role_id: '',
    is_active: true,
    ...user
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Uživatelské jméno *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{user ? 'Nové heslo (volitelné)' : 'Heslo *'}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!user}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name">Celé jméno *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="corporate_id">Firemní ID</Label>
          <Input
            id="corporate_id"
            value={formData.corporate_id}
            onChange={(e) => setFormData({ ...formData, corporate_id: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Oddělení</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role_id">Role *</Label>
          <Select value={formData.role_id.toString()} onValueChange={(value) => setFormData({ ...formData, role_id: parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Vyberte roli" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Zrušit
        </Button>
        <Button type="submit">
          {user ? 'Uložit změny' : 'Přidat uživatele'}
        </Button>
      </div>
    </form>
  )
}

function RoleForm({ role, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ...role
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Název role *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Popis</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Zrušit
        </Button>
        <Button type="submit">
          {role ? 'Uložit změny' : 'Přidat roli'}
        </Button>
      </div>
    </form>
  )
}

export default function UserList() {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editingRole, setEditingRole] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    role_id: ''
  })

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [filters])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/users?${params}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst uživatele",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    }
  }

  const handleSaveUser = async (userData) => {
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: editingUser ? "Uživatel byl aktualizován" : "Uživatel byl přidán"
        })
        setUserDialogOpen(false)
        setEditingUser(null)
        fetchUsers()
      } else {
        const error = await response.json()
        toast({
          title: "Chyba",
          description: error.error || "Nepodařilo se uložit uživatele",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to save user:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit uživatele",
        variant: "destructive"
      })
    }
  }

  const handleSaveRole = async (roleData) => {
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(roleData),
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: editingRole ? "Role byla aktualizována" : "Role byla přidána"
        })
        setRoleDialogOpen(false)
        setEditingRole(null)
        fetchRoles()
      } else {
        const error = await response.json()
        toast({
          title: "Chyba",
          description: error.error || "Nepodařilo se uložit roli",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to save role:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit roli",
        variant: "destructive"
      })
    }
  }

  const handleToggleUserStatus = async (userId, activate = true) => {
    try {
      const endpoint = activate ? 'activate' : 'deactivate'
      const response = await fetch(`/api/users/${userId}/${endpoint}`, {
        method: 'PUT',
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: activate ? "Uživatel byl aktivován" : "Uživatel byl deaktivován"
        })
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      toast({
        title: "Chyba",
        description: "Operace se nezdařila",
        variant: "destructive"
      })
    }
  }

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Opravdu chcete smazat tuto roli?')) return

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: "Role byla smazána"
        })
        fetchRoles()
      } else {
        const error = await response.json()
        toast({
          title: "Chyba",
          description: error.error || "Nepodařilo se smazat roli",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to delete role:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se smazat roli",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Načítání uživatelů...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Uživatelé a role</h1>
          <p className="text-gray-600">Správa uživatelských účtů a rolí</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setEditingRole(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Přidat roli
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Upravit roli' : 'Přidat novou roli'}
                </DialogTitle>
                <DialogDescription>
                  {editingRole ? 'Upravte informace o roli' : 'Vytvořte novou uživatelskou roli'}
                </DialogDescription>
              </DialogHeader>
              <RoleForm
                role={editingRole}
                onSave={handleSaveRole}
                onCancel={() => {
                  setRoleDialogOpen(false)
                  setEditingRole(null)
                }}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingUser(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Přidat uživatele
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Upravit uživatele' : 'Přidat nového uživatele'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Upravte informace o uživateli' : 'Vytvořte nový uživatelský účet'}
                </DialogDescription>
              </DialogHeader>
              <UserForm
                user={editingUser}
                roles={roles}
                onSave={handleSaveUser}
                onCancel={() => {
                  setUserDialogOpen(false)
                  setEditingUser(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stav</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Všechny stavy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Všechny stavy</SelectItem>
                  <SelectItem value="active">Aktivní</SelectItem>
                  <SelectItem value="inactive">Neaktivní</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={filters.role_id} onValueChange={(value) => setFilters({ ...filters, role_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Všechny role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Všechny role</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Section */}
      <Card>
        <CardHeader>
          <CardTitle>Role v systému</CardTitle>
          <CardDescription>Správa uživatelských rolí a oprávnění</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{role.name}</h3>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingRole(role)
                        setRoleDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {role.description && (
                  <p className="text-sm text-gray-600">{role.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className={!user.is_active ? 'opacity-75' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {user.full_name}
                  </CardTitle>
                  <CardDescription>@{user.username}</CardDescription>
                </div>
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? 'Aktivní' : 'Neaktivní'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phone}
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {user.department}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  <strong>Role:</strong> {user.role_name}
                </div>
                {user.corporate_id && (
                  <div className="text-sm text-gray-600">
                    <strong>Firemní ID:</strong> {user.corporate_id}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingUser(user)
                    setUserDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleUserStatus(user.id, !user.is_active)}
                >
                  {user.is_active ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádní uživatelé</h3>
          <p className="text-gray-600">
            Začněte přidáním prvního uživatele do systému.
          </p>
        </div>
      )}
    </div>
  )
}

