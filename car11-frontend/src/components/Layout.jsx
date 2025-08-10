import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Car, 
  Calendar, 
  Users, 
  Settings, 
  BarChart3, 
  Menu, 
  LogOut,
  Home,
  Wrench,
  AlertTriangle
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, adminOnly: true },
  { name: 'Vozidla', href: '/vehicles', icon: Car, adminOnly: false },
  { name: 'Rezervace', href: '/reservations', icon: Calendar, adminOnly: false },
  { name: 'Uživatelé', href: '/users', icon: Users, adminOnly: true },
  { name: 'Servisní záznamy', href: '/service-records', icon: Wrench, adminOnly: true },
  { name: 'Záznamy o poškození', href: '/damage-records', icon: AlertTriangle, adminOnly: true },
  { name: 'Reporty', href: '/reports', icon: BarChart3, adminOnly: true },
]

function NavigationItems({ onItemClick }) {
  const { user } = useAuth()
  const location = useLocation()
  
  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || user?.role_name === 'Administrator'
  )

  return (
    <nav className="space-y-1">
      {filteredNavigation.map((item) => {
        const isActive = location.pathname === item.href
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onItemClick}
            className={`
              flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${isActive 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center px-6 py-4 border-b">
              <Car className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">CAR11</span>
            </div>
            <div className="flex-1 px-3 py-4">
              <NavigationItems onItemClick={() => setSidebarOpen(false)} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center px-6 py-4 border-b">
            <Car className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">CAR11</span>
          </div>
          <div className="flex-1 px-3 py-4">
            <NavigationItems />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user?.full_name}</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {user?.role_name}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Odhlásit se
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

