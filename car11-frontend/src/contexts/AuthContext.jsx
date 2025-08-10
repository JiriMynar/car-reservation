import { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/check-auth', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.authenticated) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        toast({
          title: "Přihlášení úspěšné",
          description: `Vítejte, ${data.user.full_name}!`,
        })
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Chyba připojení k serveru' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      toast({
        title: "Odhlášení úspěšné",
        description: "Byli jste úspěšně odhlášeni.",
      })
    } catch (error) {
      console.error('Logout failed:', error)
      setUser(null) // Force logout even if request fails
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

