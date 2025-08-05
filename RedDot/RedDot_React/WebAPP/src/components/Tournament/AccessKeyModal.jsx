import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AccessKeyModal.css';

const AccessKeyModal = ({ onClose, onSuccess }) => {
    const [accessKey, setAccessKey] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!accessKey.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor ingresa una clave de acceso'
            });
            return;
        }

        setLoading(true);

        try {
            const success = await onSuccess(accessKey.trim());
            if (success) {
                onClose();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de acceso',
                text: error.message || 'Clave de acceso inválida'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Acceder con Clave" onClose={onClose}>
            <form onSubmit={handleSubmit} className="access-key-form">
                <div className="form-group">
                    <label htmlFor="accessKey">Clave de Acceso:</label>
                    <input
                        type="text"
                        id="accessKey"
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value)}
                        placeholder="Ingresa la clave del torneo"
                        maxLength={8}
                        style={{ textTransform: 'uppercase' }}
                        disabled={loading}
                    />
                    <small className="help-text">
                        Ingresa la clave de 8 caracteres proporcionada por el organizador
                    </small>
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
                        disabled={loading}
                    >
                        {loading ? 'Accediendo...' : 'Acceder'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AccessKeyModal;