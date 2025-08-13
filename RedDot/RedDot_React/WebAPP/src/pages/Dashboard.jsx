import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllTournaments } from '../API/Tournament.js';
import { getUsers } from '../API/User.js'; 
import { getMyTournaments } from '../API/Tournament.js';
import { getActiveTournaments } from '../API/Tournament.js';
import ApiService from '../services/apiService.js';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeTournaments: 0,
        userTournaments: 0,
        totalUsers: 0,
        recentActivity: 0
    });
    const [recentTournaments, setRecentTournaments] = useState([]);
    const [userActivity, setUserActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);


    const loadDashboardData = async () => {
        setLoading(true);
        try {
            
            // Cargar torneos primero
            let tournamentsResult;
            let misTorneos;
            let torneosActivos;
            try {
                tournamentsResult = await getAllTournaments();
                misTorneos = await getMyTournaments();
                torneosActivos = await getActiveTournaments();
            } catch (error) {
                tournamentsResult = { success: false };
            }

            // Procesar torneos
            if (tournamentsResult && tournamentsResult.success) {
             
                let tournaments = tournamentsResult.data.torneos;
              
                setStats(prev => ({
                    ...prev,
                    activeTournaments: torneosActivos.data.torneos.length,
                    userTournaments: misTorneos.data.length
                }));

                // Mostrar torneos más recientes
                const recent = tournaments
                    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
                    .slice(0, 3);
                setRecentTournaments(recent);
            }

            // Cargar usuarios de forma separada y con manejo de errores
            let usersResult;
            try {
                usersResult = await getUsers();
            } catch (error) {
                console.error('Error calling getUsers:', error);
                usersResult = { success: false, error: error.message };
            }

            // Procesar usuarios
            if (usersResult && usersResult.success) {
                const usersData = usersResult.data;
                
                let totalUsers = 0;
                
                try {
                    // Si es un array, contar elementos
                    if (Array.isArray(usersData)) {
                        totalUsers = usersData.length;
                    }
                    // Si es un número directo
                    else if (typeof usersData === 'number') {
                        totalUsers = usersData;
                    }
                    // Si es un string que contiene un número
                    else if (typeof usersData === 'string' && !isNaN(usersData)) {
                        totalUsers = parseInt(usersData);
                    }
                    // Si es un objeto con una propiedad específica
                    else if (usersData && typeof usersData === 'object') {
                        totalUsers = usersData.count || usersData.total || usersData.totalUsers || usersData.length || 0;
                    }
                    
                    
                    // Actualizar stats
                    setStats(prevStats => {
                        const newStats = {
                            ...prevStats,
                            totalUsers: totalUsers
                        };
                        return newStats;
                    });
                    
                } catch (error) {
                    console.error('Error processing users data:', error);
                }
            } else {
                console.log('Users result failed:', usersResult);
            }

            // Cargar actividad reciente del usuario
            try {
                const activityResult = await ApiService.get('Users/activity');
                if (activityResult && activityResult.success) {
                    setUserActivity(activityResult.data || []);
                }
            } catch (error) {
                console.error('Error loading user activity:', error);
            }

        } catch (error) {
            console.error('General error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };
    const estadoMap = {
    0: 'Por Iniciar',
    1: 'En Progreso',
    2: 'Terminado',
    3: 'Cancelado'
};

    const renderDashboardHeader = () => (
        <div className="dashboard-header">
            <h1>Dashboard ⭐</h1>
            <p className="page-subtitle">
                {getGreeting()}, {user?.username} Aquí tienes un resumen de la actividad en RedDot.
            </p>
        </div>
    );

    if (loading) {
        return <LoadingSpinner message="Cargando dashboard..." />;
    }

    return (
        <div className="dashboard-page">
            {renderDashboardHeader()}

            <div className="dashboard-container">
                <div className="dashboard-controls">
                    <div className="dashboard-info">
                        <h2>Panel de Control</h2>
                        <p>Gestiona tu actividad y mantente al día con las últimas novedades</p>
                    </div>
                    <div className="quick-actions">
                        <Link to="/tournaments" className="btn btn-primary">
                             Ver Torneos
                        </Link>
                        {user?.role === 'admin' && (
                            <Link to="/create-tournament" className="btn btn-success">
                                ➕ Crear Torneo
                            </Link>
                        )}
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card primary">
                        <div className="stat-icon primary">🏆</div>
                        <div className="stat-content">
                            <h3>{stats.activeTournaments}</h3>
                            <p>Torneos Activos</p>
                        </div>
                    </div>

                    <div className="stat-card success">
                        <div className="stat-icon success">🎮</div>
                        <div className="stat-content">
                            <h3>{stats.userTournaments}</h3>
                            <p>Mis Torneos</p>
                        </div>
                    </div>

                    <div className="stat-card info">
                        <div className="stat-icon info">👥</div>
                        <div className="stat-content">
                            <h3>{stats.totalUsers}</h3>
                            <p>Usuarios Registrados</p>
                        </div>
                    </div>

                    <div className="stat-card warning">
                        <div className="stat-icon warning">📊</div>
                        <div className="stat-content">
                            <h3>{stats.recentActivity || 0}</h3>
                            <p>Actividad Reciente</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="section">
                        <div className="section-header">
                            <h2><span className="emoji">🏆</span> Torneos Recientes</h2>
                            <Link to="/tournaments" className="view-all-link">
                                Ver todos →
                            </Link>
                        </div>

                        {recentTournaments.length > 0 ? (
                            <div className="tournaments-list">
                                {recentTournaments.map(tournament => (
                                    <div key={tournament.id} className="tournament-item">
                                        <div className="tournament-info">
                                            <h4>{tournament.nombre}</h4>
                                            <p className="tournament-meta">
                                                {formatDate(tournament.fechaInicio)} •
                                                
                                                {tournament.cupos_maximos} cupos
                                            </p>
                                        </div>
                                        <div className="tournament-status">
                                            <span className={`status-badge ${estadoMap[tournament.estado]?.toLowerCase().replace(/\s/g, '-')}`}>
                                                {estadoMap[tournament.estado]}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No hay torneos recientes</p>
                            </div>
                        )}
                    </div>

                    <div className="section">
                        <div className="section-header">
                            <h2><span className="emoji">📈</span> Actividad Reciente</h2>
                        </div>

                        {userActivity.length > 0 ? (
                            <div className="activity-list">
                                {userActivity.slice(0, 5).map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-icon">
                                            {activity.type === 'join' ? '✅' :
                                                activity.type === 'win' ? '🏆' :
                                                    activity.type === 'create' ? '➕' : '📝'}
                                        </div>
                                        <div className="activity-content">
                                            <p>{activity.description}</p>
                                            <span className="activity-time">
                                                {formatDate(activity.fecha)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No hay actividad reciente</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;