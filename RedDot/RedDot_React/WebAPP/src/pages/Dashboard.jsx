import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllTournaments } from '../API/Tournament.js';
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
            // Cargar estadísticas generales
            const [tournamentsResult, statsResult] = await Promise.all([
                getAllTournaments(),
                ApiService.get('Dashboard/stats')
            ]);

            if (tournamentsResult.success) {
                const tournaments = tournamentsResult.data || [];
                const activeTournaments = tournaments.filter(t => t.estado?.toLowerCase() === 'activo');
                const userTournaments = tournaments.filter(t =>
                    t.participantes?.includes(user?.id)
                );

                setStats(prev => ({
                    ...prev,
                    activeTournaments: activeTournaments.length,
                    userTournaments: userTournaments.length
                }));

                // Mostrar torneos más recientes
                const recent = tournaments
                    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
                    .slice(0, 3);
                setRecentTournaments(recent);
            }

            if (statsResult.success) {
                setStats(prev => ({
                    ...prev,
                    ...statsResult.data
                }));
            }

            // Cargar actividad reciente del usuario
            const activityResult = await ApiService.get('Users/activity');
            if (activityResult.success) {
                setUserActivity(activityResult.data || []);
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
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

    if (loading) {
        return <LoadingSpinner message="Cargando dashboard..." />;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>{getGreeting()}, {user?.username || 'Usuario'}! 👋</h1>
                    <p>Aquí tienes un resumen de la actividad en RedDot</p>
                </div>
                <div className="quick-actions">
                    <Link to="/tournaments" className="btn btn-primary">
                        🏆 Ver Torneos
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
                    <div className="stat-icon">🏆</div>
                    <div className="stat-content">
                        <h3>{stats.activeTournaments}</h3>
                        <p>Torneos Activos</p>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">🎮</div>
                    <div className="stat-content">
                        <h3>{stats.userTournaments}</h3>
                        <p>Mis Torneos</p>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{stats.totalUsers || 0}</h3>
                        <p>Usuarios Registrados</p>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>{stats.recentActivity || 0}</h3>
                        <p>Actividad Reciente</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="section">
                    <div className="section-header">
                        <h2> Torneos Recientes</h2>
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
                                            {tournament.cuposDisponibles}/{tournament.cuposMaximos} cupos
                                        </p>
                                    </div>
                                    <div className="tournament-status">
                                        <span className={`status-badge ${tournament.estado?.toLowerCase()}`}>
                                            {tournament.estado}
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
                        <h2> Actividad Reciente</h2>
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
    );
};

export default Dashboard;