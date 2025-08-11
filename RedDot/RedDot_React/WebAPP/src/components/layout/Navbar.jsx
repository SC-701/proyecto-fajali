import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Swal from 'sweetalert2';
import '../../styles/Navbar.css';
import { getUserProfile } from '../../API/User.js';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState("");

    useEffect( () => {
        loadUsername();
    })

    const loadUsername = async () => {
        try {
            const result = await getUserProfile(user);
            if (result.success) {
                setUsername(result.data.username);
            } else {
                setUsername("Usuario");
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }


    }
    const handleLogout = () => {
        Swal.fire({
            title: '¿Cerrar Sesión?',
            text: "¿Estás seguro que deseas cerrar sesión?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate('/');
                Swal.fire({
                    title: 'Sesión Cerrada',
                    text: 'Has cerrado sesión exitosamente',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };



    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/dashboard" className="brand-link">
                        <span className="brand-logo">🎯</span>
                        <span className="brand-text">RedDot</span>
                    </Link>
                </div>

                <div className="navbar-menu">
                    <Link
                        to="/dashboard"
                        className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/tournaments"
                        className={`nav-link ${isActive('/tournaments') ? 'active' : ''}`}
                    >
                        Torneos
                    </Link>
                    <Link
                        to="/Participando"
                        className={`nav-link ${isActive('/Participando') ? 'active' : ''}`}
                    >
                        Partcipando
                    </Link>
                    {user?.role === 'admin' && (
                        <Link
                            to="/admin"
                            className="nav-link admin-link"
                        >
                            Admin Panel
                        </Link>
                    )}
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <span className="user-name">
                            {username}
                        </span>
                        
                    </div>
                    <div className="user-menu">
                        <Link to="/profile" className="profile-link">
                            Perfil
                        </Link>
                        <button onClick={handleLogout} className="logout-btn">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;