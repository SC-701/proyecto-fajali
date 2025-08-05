import React, { useState, useEffect } from 'react';
import { createTournament, TournamentCategories } from '../../API/Tournament.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Modal from '../UI/Modal.jsx';
import './CreateTournamentModal.css';

const SPORTS_MAPPING = {
    0: ['Boxeo', 'Karate', 'MMA', 'Taekwondo', 'Judo'], // Contacto
    1: ['Fútbol', 'Baloncesto', 'Voleibol', 'Rugby', 'Hockey'], // Equipo
    2: ['Tennis', 'Badminton', 'Squash', 'Paddle', 'Ping Pong'], // Raqueta
    3: ['Ajedrez', 'Natación', 'Atletismo', 'Golf', 'Ciclismo'] // Otros
};

const CreateTournamentModal = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: TournamentCategories.OTROS,
        tipoDeporte: '',
        ubicacion: '',
        descripcionPremio: '',
        participantesIds: []
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [deportesDisponibles, setDeportesDisponibles] = useState([]);

    // Actualizar deportes disponibles cuando cambia la categoría
    useEffect(() => {
        setDeportesDisponibles(SPORTS_MAPPING[formData.categoria] || []);
        // Resetear el tipo de deporte si no está en la nueva lista
        if (!SPORTS_MAPPING[formData.categoria]?.includes(formData.tipoDeporte)) {
            setFormData(prev => ({ ...prev, tipoDeporte: '' }));
        }
    }, [formData.categoria]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'categoria' ? parseInt(value) : value
        }));

        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
        if (!formData.descripcion.trim()) errors.descripcion = 'La descripción es requerida';
        if (!formData.tipoDeporte.trim()) errors.tipoDeporte = 'El tipo de deporte es requerido';

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            Swal.fire({
                title: 'Creando torneo...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const result = await createTournament(formData);

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Torneo creado!',
                    html: `
                        Tu torneo ha sido creado exitosamente.<br>
                        <strong>Clave de acceso:</strong> ${result.data.accessKey}<br>
                        <small>Guarda esta clave para compartirla con los participantes.</small>
                    `,
                    confirmButtonText: 'Copiar clave y continuar',
                    showCancelButton: true,
                    cancelButtonText: 'Agregar participantes ahora'
                }).then((res) => {
                    if (res.isConfirmed) {
                        navigator.clipboard.writeText(result.data.accessKey);
                        onSuccess();
                        onClose();
                    } else {
                        navigate(`/torneos/${result.data.id}/participantes`);
                    }
                });
            } else {
                throw new Error(result.error || 'Error al crear el torneo');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo crear el torneo'
            });
        }
    };

    return (
        <Modal title="Crear Torneo de Eliminación" onClose={onClose}>
            <div className="create-tournament-form">
                <div className="form-group">
                    <label htmlFor="nombre">Nombre del Torneo *</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={validationErrors.nombre ? 'input-error' : ''}
                    />
                    {validationErrors.nombre && <div className="error-message">{validationErrors.nombre}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="descripcion">Descripción *</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="3"
                        className={validationErrors.descripcion ? 'input-error' : ''}
                    ></textarea>
                    {validationErrors.descripcion && <div className="error-message">{validationErrors.descripcion}</div>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="categoria">Categoría *</label>
                        <select
                            id="categoria"
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                        >
                            <option value={TournamentCategories.CONTACTO}>Contacto</option>
                            <option value={TournamentCategories.EQUIPO}>Equipo</option>
                            <option value={TournamentCategories.RAQUETA}>Raqueta</option>
                            <option value={TournamentCategories.OTROS}>Otros</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tipoDeporte">Tipo de Deporte *</label>
                        <select
                            id="tipoDeporte"
                            name="tipoDeporte"
                            value={formData.tipoDeporte}
                            onChange={handleChange}
                            className={validationErrors.tipoDeporte ? 'input-error' : ''}
                        >
                            <option value="">Selecciona un deporte</option>
                            {deportesDisponibles.map(deporte => (
                                <option key={deporte} value={deporte}>{deporte}</option>
                            ))}
                        </select>
                        {validationErrors.tipoDeporte && <div className="error-message">{validationErrors.tipoDeporte}</div>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="ubicacion">Ubicación (opcional)</label>
                        <input
                            type="text"
                            id="ubicacion"
                            name="ubicacion"
                            value={formData.ubicacion}
                            onChange={handleChange}
                            placeholder="Lugar del torneo"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcionPremio">Premio (opcional)</label>
                        <input
                            type="text"
                            id="descripcionPremio"
                            name="descripcionPremio"
                            value={formData.descripcionPremio}
                            onChange={handleChange}
                            placeholder="Descripción del premio"
                        />
                    </div>
                </div>

                <div className="info-alert">
                    Los participantes se agregarán después de crear el torneo. Necesitarás exactamente 8 participantes para poder iniciar el torneo.
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                        Crear Torneo
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateTournamentModal;