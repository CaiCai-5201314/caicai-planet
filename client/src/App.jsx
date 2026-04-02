import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

import Home from './pages/Home'
import Login from './Login_Management/Login'
import Register from './Login_Management/Register'
import AdminLogin from './Login_Management/AdminLogin'
import Community from './pages/Community'
import Friends from './pages/Friends'
import About from './pages/About'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import AdminDashboard from './Admin_Management/Dashboard'
import Notifications from './pages/Notifications'

function App() {
  const { fetchUser } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser()
    }
  }, [fetchUser])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/community" element={<Community />} />
      <Route path="/friends" element={<Friends />} />
      <Route path="/about" element={<About />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/create-post" element={<CreatePost />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App
