import React, { useState } from 'react';
import { createEliminationTournament, TournamentCategories } from '../../API/TournamentElimination.js';
import Swal from 'sweetalert2';
import './CreateTournament.css';
import './ModalBase.css'; 

const CreateEliminationTournament = ({ onClose, onTournamentCreated }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: TournamentCategories.OTROS,
        tipoDeporte: '',
        participantesIds: ['', '', '', '', '', '', '', ''] // 8 participantes
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleParticipantChange = (index, value) => {
        const newParticipants = [...formData.participantesIds];
        newParticipants[index] = value;
        setFormData(prev => ({
            ...prev,
            participantesIds: newParticipants
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.nombre.trim()) {
            Swal.fire('Error', 'El nombre del torneo es requerido', 'error');
            return;
        }

        if (!formData.descripcion.trim()) {
            Swal.fire('Error', 'La descripción es requerida', 'error');
            return;
        }

        if (!formData.tipoDeporte.trim()) {
            Swal.fire('Error', 'El tipo de deporte es requerido', 'error');
            return;
        }

        const participants = formData.participantesIds.filter(id => id.trim());
        if (participants.length !== 8) {
            Swal.fire('Error', 'Se requieren exactamente 8 participantes', 'error');
            return;
        }

        const uniqueParticipants = new Set(participants);
        if (uniqueParticipants.size !== 8) {
            Swal.fire('Error', 'No se permiten participantes duplicados', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await createEliminationTournament({
                ...formData,
                participantesIds: participants
            });

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Torneo creado!',
                    html: `
                        <p>Torneo creado exitosamente</p>
                        <div style="background:#f3f4f6; padding:10px; border-radius:8px; margin:10px 0;">
                            <strong>Clave de acceso:</strong><br>
                            <code style="font-size:18px; color:#dc2626; font-weight:bold;">
                                ${result.data.accessKey}
                            </code>
                        </div>
                        <p style="font-size:14px; color:#6b7280;">
                            Comparte esta clave con los participantes para que puedan acceder al torneo
                        </p>
                    `,
                    confirmButtonText: 'Copiar clave',
                    showCancelButton: true,
                    cancelButtonText: 'Cerrar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigator.clipboard.writeText(result.data.accessKey);
                        Swal.fire('¡Copiado!', 'Clave copiada al portapapeles', 'success');
                    }
                });

                onTournamentCreated?.();
                onClose?.();
            } else {
                Swal.fire('Error', result.error || 'Error al crear el torneo', 'error');
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Error inesperado', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content create-tournament-modal">
                <div className="modal-header">
                    <h2>🏆 Crear Torneo de Eliminación Directa</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="tournament-form">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre del Torneo *</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción *</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            maxLength={500}
                            rows={3}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="categoria">Categoría *</label>
                            <select
                                id="categoria"
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleInputChange}
                                required
                            >
                                <option value={TournamentCategories.CONTACTO}>Contacto</option>
                                <option value={TournamentCategories.EQUIPO}>Equipo</option>
                                <option value={TournamentCategories.RAQUETA}>Raqueta</option>
                                <option value={TournamentCategories.OTROS}>Otros</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="tipoDeporte">Tipo de Deporte *</label>
                            <input
                                type="text"
                                id="tipoDeporte"
                                name="tipoDeporte"
                                value={formData.tipoDeporte}
                                onChange={handleInputChange}
                                maxLength={50}
                                placeholder="ej: Fútbol, Tenis, Boxeo..."
                                required
                            />
                        </div>
                    </div>

                    <div className="participants-section">
                        <h3>Participantes (8 requeridos)</h3>
                        <div className="participants-grid">
                            {formData.participantesIds.map((participant, index) => (
                                <div key={index} className="form-group">
                                    <label htmlFor={`participant-${index}`}>
                                        Participante {index + 1} *
                                    </label>
                                    <input
                                        type="text"
                                        id={`participant-${index}`}
                                        value={participant}
                                        onChange={(e) => handleParticipantChange(index, e.target.value)}
                                        placeholder="ID o nombre del participante"
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="access-key-info">
                        <div className="info-box">
                            <h4>ℹ️ Información importante</h4>
                            <p>• Se generará una <strong>clave de acceso</strong> automáticamente</p>
                            <p>• Solo tú podrás ingresar resultados y avanzar rondas</p>
                            <p>• Los participantes pueden ver el bracket con la clave</p>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Torneo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEliminationTournament;