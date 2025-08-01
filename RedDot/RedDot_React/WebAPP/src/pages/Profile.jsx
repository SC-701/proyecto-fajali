import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import ApiService from '../services/apiService.js';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import Swal from 'sweetalert2';
import '../styles/Profile.css';

const Profile = () => {
    const { user, login } = useAuth();
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        avatar: '',
        bio: ''
    });
    const [stats, setStats] = useState({
        tournamentsJoined: 0,
        tournamentsWon: 0,
        totalPoints: 0,
        currentRank: 0
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        loadProfileData();
        loadUserStats();
    }, []);

    const loadProfileData = async () => {
        try {
            const result = await ApiService.get('Usuarios/profile');
            if (result.success) {
                setProfileData(result.data);
                setFormData(result.data);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadUserStats = async () => {
        try {
            const result = await ApiService.get('Usuarios/stats');
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            const result = await ApiService.put('Usuarios/profile', formData);
            if (result.success) {
                setProfileData(formData);
                setEditing(false);
                Swal.fire({
                    icon: 'success',
                    title: '¡Perfil actualizado!',
                    text: 'Tus datos se han guardado correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.error[0]?.title || 'No se pudo actualizar el perfil'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error inesperado al actualizar perfil'
            });
        }
    };

    const handleCancelEdit = () => {
        setFormData(profileData);
        setEditing(false);
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    };

    if (loading) {
        return <LoadingSpinner message="Cargando perfil..." />;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1>Mi Perfil</h1>
                <p className="profile-subtitle">Gestiona tu información personal y estadísticas</p>
            </div>

            <div className="profile-content">
                <div className="profile-sidebar">
                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            {profileData.avatar ? (
                                <img src={profileData.avatar} alt="Avatar" />
                            ) : (
                                getInitials(profileData.firstName || profileData.username)
                            )}
                        </div>
                        <h2 className="profile-name">
                            {profileData.firstName && profileData.lastName
                                ? `${profileData.firstName} ${profileData.lastName}`
                                : profileData.username
                            }
                        </h2>
                        <p className="profile-role">{user?.role || 'Usuario'}</p>
                    </div>

                    <div className="profile-stats">
                        <h3>Estadísticas</h3>
                        <div className="stat-item">
                            <span className="stat-label">🏆 Torneos Participados</span>
                            <span className="stat-value">{stats.tournamentsJoined}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">🥇 Torneos Ganados</span>
                            <span className="stat-value">{stats.tournamentsWon}</span>
                        </div>
                        
                    </div>
                </div>

                <div className="profile-main">
                    <div className="profile-form-header">
                        <h3>Información Personal</h3>
                        {!editing ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => setEditing(true)}
                            >
                                ✏️ Editar
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button
                                    className="btn btn-success"
                                    onClick={handleSaveProfile}
                                >
                                    💾 Guardar
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleCancelEdit}
                                >
                                    ❌ Cancelar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre de Usuario</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editing ? formData.username : profileData.username}
                                    onChange={handleInputChange}
                                    disabled={!editing}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editing ? formData.email : profileData.email}
                                    onChange={handleInputChange}
                                    disabled={!editing}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={editing ? formData.firstName : profileData.firstName}
                                    onChange={handleInputChange}
                                    disabled={!editing}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Apellido</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={editing ? formData.lastName : profileData.lastName}
                                    onChange={handleInputChange}
                                    disabled={!editing}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Biografía</label>
                            <textarea
                                name="bio"
                                value={editing ? formData.bio : profileData.bio}
                                onChange={handleInputChange}
                                disabled={!editing}
                                className="form-textarea"
                                rows="4"
                                placeholder="Cuéntanos algo sobre ti..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;