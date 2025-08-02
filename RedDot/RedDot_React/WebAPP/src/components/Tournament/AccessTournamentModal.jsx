import React, { useState } from 'react';
import { accessTournamentWithKey } from '../../API/TournamentElimination.js';
import Swal from 'sweetalert2';
import './ModalBase.css';
import './AccessModal.css';

const AccessTournamentModal = ({ onClose, onTournamentAccessed }) => {
    const [accessKey, setAccessKey] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!accessKey.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor ingresa una clave de acceso'
            });
            return;
        }

        setLoading(true);
        try {
            const result = await accessTournamentWithKey(accessKey.trim());

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Acceso concedido!',
                    text: `Has accedido al torneo: ${result.data.nombre}`,
                    timer: 2000,
                    showConfirmButton: false
                });

                onTournamentAccessed?.(result.data);
                onClose();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Clave inválida',
                    text: 'La clave de acceso no es válida o el torneo no existe'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al acceder al torneo'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content access-modal">
                <div className="modal-header">
                    <h2>🔑 Acceder con Clave</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <p className="access-description">
                        Ingresa la clave de acceso proporcionada por el organizador del torneo
                    </p>

                    <form onSubmit={handleSubmit} className="access-form">
                        <div className="form-group">
                            <label htmlFor="accessKey">Clave de Acceso</label>
                            <input
                                type="text"
                                id="accessKey"
                                value={accessKey}
                                onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                                placeholder="Ej: ABC123XY"
                                maxLength={8}
                                className="access-key-input"
                                autoFocus
                            />
                            <small className="form-hint">
                                La clave tiene formato de 8 caracteres alfanuméricos
                            </small>
                        </div>

                        <div className="access-info">
                            <div className="info-box">
                                <h4>ℹ️ ¿Cómo obtener la clave?</h4>
                                <ul>
                                    <li>El organizador del torneo debe proporcionarte la clave</li>
                                    <li>Con esta clave podrás ver el bracket del torneo</li>
                                    <li>Solo el organizador puede modificar resultados</li>
                                </ul>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !accessKey.trim()}
                            >
                                {loading ? 'Verificando...' : 'Acceder'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccessTournamentModal;