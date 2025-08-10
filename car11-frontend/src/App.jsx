import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import VehicleList from './components/VehicleList'
import ReservationList from './components/ReservationList'
import UserList from './components/UserList'
import ServiceRecords from './components/ServiceRecords'
import DamageRecords from './components/DamageRecords'
import Reports from './components/Reports'
import Layout from './components/Layout'
import './App.css'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Načítání...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (adminOnly && user.role_name !== 'Administrator') {
    return <Navigate to="/" replace />
  }
  
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            {user?.role_name === 'Administrator' ? <Dashboard /> : <ReservationList />}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/vehicles" element={
        <ProtectedRoute>
          <Layout>
            <VehicleList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reservations" element={
        <ProtectedRoute>
          <Layout>
            <ReservationList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute adminOnly>
          <Layout>
            <UserList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/service-records" element={
        <ProtectedRoute adminOnly>
          <Layout>
            <ServiceRecords />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/damage-records" element={
        <ProtectedRoute adminOnly>
          <Layout>
            <DamageRecords />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute adminOnly>
          <Layout>
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App

