import './styles/app.css'
import './styles/Modal.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import Layout from './components/layout/Layout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tournaments from './pages/Tournaments.jsx'
import Participando from './pages/Participando.jsx'
import Profile from './pages/Profile.jsx'

function App() {
    document.body.style.backgroundColor = '#111827';
    document.body.style.color = '#f9fafb';
    document.body.style.margin = '0';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    return (
        <AuthProvider>
            <Router>
                <Routes>
                
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/tournaments" element={
                        <ProtectedRoute>
                            <Layout>
                                <Tournaments />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/participando" element={
                        <ProtectedRoute>
                            <Layout>
                                <Participando />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    

                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Layout>
                                <Profile />
                            </Layout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App