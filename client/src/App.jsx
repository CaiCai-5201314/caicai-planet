import { Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom'
import React, { lazy, Suspense, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import sessionChecker from './utils/sessionChecker'

import Home from './pages/Home'
import Login from './login_management/Login'
import Register from './login_management/Register'
import ForgotPassword from './login_management/ForgotPassword'
import AdminLogin from './login_management/AdminLogin'
import Community from './pages/Community'
import Friends from './pages/Friends'
import About from './pages/About'
import Secret from './pages/Secret'
import NotFound from './pages/NotFound'
import Unauthorized from './pages/Unauthorized'
import ServerError from './pages/ServerError'
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
import Announcement from './components/Announcement'

// 个人主页重定向组件
function ProfileRedirect() {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={`/profile/${user.username}`} replace />;
}

// 短链接处理组件
function ShortLinkHandler() {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [password, setPassword] = React.useState('');
  const [showPasswordInput, setShowPasswordInput] = React.useState(false);

  const handleShortLink = async (password = '') => {
    // 确保用户已登录
    if (!isAuthenticated) {
      // 直接导航到登录页
      alert('请先登录再访问短链接');
      navigate('/login');
      return;
    }

    try {
      console.log('处理短链接:', shareCode);
      console.log('用户已登录:', isAuthenticated);

      // 验证短链接
      console.log('发送API请求验证短链接');
      
      // 尝试直接使用fetch API
      const token = localStorage.getItem('token');
      const response = await fetch('/api/share/friend-link/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shareCode, password })
      });

      console.log('API请求状态:', response.status);
      const data = await response.json();
      console.log('API响应数据:', data);

      if (data.success) {
        // 增加点击次数
        console.log('增加短链接点击次数');
        const token = localStorage.getItem('token');
        await fetch(`/share/friend-link/${shareCode}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // 重定向到目标网站
        console.log('短链接有效，重定向到:', data.data.url);
        window.location.href = data.data.url;
      } else if (data.message === '密码错误') {
        // 显示密码输入框
        setShowPasswordInput(true);
      } else {
        console.log('短链接无效或已过期:', data.message);
        alert('短链接无效或已过期: ' + data.message);
        navigate('/');
      }
    } catch (error) {
        console.error('处理短链接失败:', error);
        console.error('错误消息:', error.message);
        console.error('错误状态:', error.response?.status);
        if (error.response?.status === 401) {
          window.location.href = '/401';
        } else if (error.response?.status === 404) {
          window.location.href = '/404';
        } else if (error.response?.status >= 500) {
          window.location.href = '/500';
        } else {
          alert('处理短链接失败: ' + (error.message || '未知错误'));
          navigate('/');
        }
      }
  };

  useEffect(() => {
    handleShortLink();
  }, [shareCode, navigate, isAuthenticated]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    handleShortLink(password);
  };

  if (showPasswordInput) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-teal-900 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">输入密码</h1>
          <p className="text-gray-600 mb-6 text-center">此链接需要密码才能访问</p>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 mb-2">密码</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入密码"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              提交
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-teal-900 p-4">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-20 h-20 border-4 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">处理短链接中</h1>
        <p className="text-blue-100 text-lg mb-8">正在验证您的访问权限，请稍候...</p>
        <div className="w-64 h-1 bg-blue-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-300 animate-pulse" style={{ width: '70%' }}></div>
        </div>
        <p className="text-blue-200 mt-6 text-sm">
          如有任何问题，请联系网站管理员
        </p>
      </div>
    </div>
  );
}

function App() {
  const { user, fetchUser } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser()
      // 启动登录状态检测
      sessionChecker.startChecking()
    }
    
    // 清理函数
    return () => {
      sessionChecker.stopChecking()
    }
  }, [fetchUser])

  useEffect(() => {
    if (user?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [user?.theme])

  return (
    <>
      <Announcement />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin-caicai0304/login" element={<AdminLogin />} />
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
        <Route path="/profile" element={
          <AuthProtected>
            <ProfileRedirect />
          </AuthProtected>
        } />
        <Route path="/profile/:username" element={
          <AuthProtected>
            <Profile />
          </AuthProtected>
        } />
        <Route path="/settings" element={
          <AuthProtected>
            <Settings />
          </AuthProtected>
        } />
        <Route path="/notifications" element={
          <AuthProtected>
            <Notifications />
          </AuthProtected>
        } />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/create-post" element={
          <AuthProtected>
            <CreatePost />
          </AuthProtected>
        } />
        <Route path="/admin-caicai0304/*" element={<AdminDashboard />} />
        <Route path="/short/:shareCode" element={<ShortLinkHandler />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/401" element={<Unauthorized />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
