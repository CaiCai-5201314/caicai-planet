import { Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useAuthStore } from './store/authStore'

import Home from './pages/Home'
import Login from './Login_Management/Login'
import Register from './Login_Management/Register'
import ForgotPassword from './Login_Management/ForgotPassword'
import AdminLogin from './Login_Management/AdminLogin'
import Community from './pages/Community'
import Friends from './pages/Friends'
import About from './pages/About'
import Secret from './pages/Secret'
const Tasks = lazy(() => import('./pages/Tasks'))
const MaleTasks = lazy(() => import('./pages/MaleTasks'))
const FemaleTasks = lazy(() => import('./pages/FemaleTasks'))
const SportsChallenge = lazy(() => import('./pages/SportsChallenge'))
const TechExplore = lazy(() => import('./pages/TechExplore'))
const BeautyCare = lazy(() => import('./pages/BeautyCare'))
const CreativeCrafts = lazy(() => import('./pages/CreativeCrafts'))
const TaskTypeDetail = lazy(() => import('./pages/TaskTypeDetail'))
const TaskDetail = lazy(() => import('./pages/TaskDetail'))
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import AdminDashboard from './Admin_Management/Dashboard'
import Notifications from './pages/Notifications'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import AuthProtected from './components/AuthProtected'

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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/community" element={<Community />} />
      <Route path="/friends" element={<Friends />} />
      <Route path="/about" element={<About />} />
      <Route path="/secret" element={<Secret />} />
      <Route path="/tasks" element={
        <AuthProtected>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-teal-900"><div className="text-white text-2xl">加载中...</div></div>}>
            <Tasks />
          </Suspense>
        </AuthProtected>
      } />
      <Route path="/tasks/male" element={
        <AuthProtected>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-cyan-900"><div className="text-white text-2xl">加载中...</div></div>}>
            <MaleTasks />
          </Suspense>
        </AuthProtected>
      } />
      <Route path="/tasks/female" element={
        <AuthProtected>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 to-purple-900"><div className="text-white text-2xl">加载中...</div></div>}>
            <FemaleTasks />
          </Suspense>
        </AuthProtected>
      } />
      <Route path="/tasks/male/sports" element={
        <AuthProtected>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900"><div className="text-white text-2xl">加载中...</div></div>}>
            <SportsChallenge />
          </Suspense>
        </AuthProtected>
      } />
      <Route path="/tasks/male/tech" element={
        <AuthProtected>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-900 to-blue-900"><div className="text-white text-2xl">加载中...</div></div>}>
            <TechExplore />
          </Suspense>
        </AuthProtected>
      } />
      <Route path="/tasks/female/beauty" element={
        <AuthProtected>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 to-rose-900"><div className="text-white text-2xl">加载中...</div></div>}>
            <BeautyCare />
          </Suspense>
        </AuthProtected>
      } />
      <Route path="/tasks/female/crafts" element={
        <AuthProtected>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900"><div className="text-white text-2xl">加载中...</div></div>}>
            <CreativeCrafts />
          </Suspense>
        </AuthProtected>
      } />
      {/* 动态任务类型路由 */}
      <Route path="/tasks/:gender/:id" element={
        <AuthProtected>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"><div className="text-planet-purple text-2xl">加载中...</div></div>}>
            <TaskTypeDetail />
          </Suspense>
        </AuthProtected>
      } />
      {/* 任务详情路由 */}
      <Route path="/task/:id" element={
        <AuthProtected>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"><div className="text-planet-purple text-2xl">加载中...</div></div>}>
            <TaskDetail />
          </Suspense>
        </AuthProtected>
      } />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/create-post" element={<CreatePost />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
    </Routes>
  )
}

export default App
