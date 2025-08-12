import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserProfile, updateUserProfile } from '../API/User.js';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import Swal from 'sweetalert2';
import '../styles/Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        description: '',
        tournamentsJoined: 0,
        tournamentsWon: 0,
        tournaments: []
    });

    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            const result = await getUserProfile(user);
            if (result.success) {
                setProfileData(result.data);
                setFormData(result.data);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
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
            const result = await updateUserProfile(formData);
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
                <h1>Mi Perfil 👤</h1>
                <p className="page-subtitle">
                    Gestiona tu información personal en RedDot.
                </p>
            </div>

            <div className="profile-container">
                <div className="profile-content">
                    <div className="profile-sidebar">
                        <div className="profile-avatar">
                            <div className="avatar-circle">
                                {getInitials(profileData.username)}
                            </div>
                            <h2 className="profile-name">
                                {profileData.username}
                            </h2>
                            <p className="profile-role">{user?.role || 'Usuario'}</p>
                        </div>

                        <div className="profile-stats">
                            <h3>Estadísticas</h3>
                            <div className="stat-item">
                                <span className="stat-label">🏆 Torneos Participados</span>
                                <span className="stat-value">{profileData.tournamentsJoined}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">🥇 Torneos Ganados</span>
                                <span className="stat-value">{profileData.tournamentsWon}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-main">
                        <div className="profile-card">
                            <div className="card-header">
                                <h3 className="card-title">Información Personal</h3>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Nombre de Usuario</label>
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
                                    <label className="form-label">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editing ? formData.email : profileData.email}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Biografía</label>
                                    <textarea
                                        name="description"
                                        value={editing ? formData.description : profileData.description}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className="form-textarea"
                                        rows="4"
                                        placeholder="Cuéntanos algo sobre ti..."
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                {editing ? (
                                    <div className="edit-actions">
                                        <button
                                            className="btn btn-primary"
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
                                ) : (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setEditing(true)}
                                    >
                                        ✏️ Editar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;