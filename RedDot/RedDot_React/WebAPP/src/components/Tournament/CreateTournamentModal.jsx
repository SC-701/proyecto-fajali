import { useState, useEffect } from 'react';
import { createTournament, getCategorias } from '../../API/Tournament.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Modal from '../UI/Modal.jsx';
import '../../styles/CreateTournamentModal.css';



const CreateTournamentModal = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categorias: '',
        tipoDeporte: '',
        ubicacion: '',
        descripcionPremio: '',
        reglas: '',
        creadorId: user,
        cupos: 0,
        fecha_inicio: '',


    });
    const [categorias, setCategories] = useState([]);
    const [deportes, setDeportes] = useState([]);
    const [isSelected, setIsSelected] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [deportesDisponibles, setDeportesDisponibles] = useState([]);



    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await getCategorias();
                if (result.success) {
                    setCategories(result.data);
                } else {
                    throw new Error(result.error || 'Error al cargar las categorías');
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'No se pudieron cargar las categorías'
                });
            }
        }
        fetchCategories();
    }, []);



    const setSportType = (idCategoria) => {

        var deportes = categorias.find(category => category.id_categoria === idCategoria)?.deportes || '';
        setDeportes(deportes);
    };

    const isCategorySelected = () => {
        setIsSelected(true);

    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'categoria' || name === 'cupos' ? parseInt(value) : value
        }));

        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (name === 'categoria') {
            isCategorySelected();
            setSportType(parseInt(value));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
        if (!formData.descripcion.trim()) errors.descripcion = 'La descripción es requerida';
        if (!formData.tipoDeporte.trim()) errors.tipoDeporte = 'El tipo de deporte es requerido';
        if (!formData.categoria) errors.categoria = 'La categoría es requerida';
        if (!formData.fecha_inicio) errors.fecha_inicio = 'La fecha de inicio es requerida';
        if (formData.cupos <= 0) errors.cupos = 'Los cupos deben ser mayores a 0';
        if (formData.descripcionPremio && formData.descripcionPremio.length > 100) {
            errors.descripcionPremio = 'La descripción del premio no puede exceder los 100 caracteres';
        }
        if (formData.reglas && formData.reglas.length > 500) {
            errors.reglas = 'Las reglas no pueden exceder los 500 caracteres';
        }
        if (formData.ubicacion && formData.ubicacion.length > 100) {
            errors.ubicacion = 'La ubicación no puede exceder los 100 caracteres';
        }

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
                <div className="form-group">
                    <label htmlFor="reglas">Reglas *</label>
                    <textarea
                        id="reglas"
                        name="reglas"
                        value={formData.reglas}
                        onChange={handleChange}
                        rows="3"
                        className={validationErrors.reglas ? 'input-error' : ''}
                    ></textarea>
                    {validationErrors.reglas && <div className="error-message">{validationErrors.reglas}</div>}
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
                            <option value="">Seleccione una categoría</option>
                            {categorias.map(category => (
                                <option key={category.id_categoria} value={category.id_categoria}>
                                    {category.categoria}
                                </option>
                            ))}
                        </select>
                        {validationErrors.categoria && <div className="error-message">{validationErrors.categoria}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="tipoDeporte">Tipo de Deporte *</label>
                        <select
                            id="tipoDeporte"
                            name="tipoDeporte"
                            value={formData.tipoDeporte}
                            onChange={handleChange}

                            disabled={!isSelected}

                        >
                            <option value="">Seleccione un deporte</option>
                            {deportes.map(deporte => (
                                <option key={deporte.nombre} value={deporte.nombre}>
                                    {deporte.nombre}
                                </option>

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
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="fecha_inicio">Fecha de Inicio *</label>
                        <input
                            type="date"
                            id="fecha_inicio"
                            name="fecha_inicio"
                            value={formData.fecha_inicio}
                            onChange={handleChange}
                            className={validationErrors.fecha_inicio ? 'input-error' : ''}
                        />
                        {validationErrors.fecha_inicio && <div className="error-message">{validationErrors.fecha_inicio}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cupos">Cupos *</label>
                        <select
                            id="cupos"
                            name="cupos"
                            value={formData.cupos}
                            onChange={handleChange}
                            className={validationErrors.cupos ? 'input-error' : ''}
                        >
                            <option value="">Seleccione los cupos</option>
                            <option value="4">4</option>
                            <option value="8">8</option>
                        </select>
                        {validationErrors.cupos && <div className="error-message">{validationErrors.cupos}</div>}
                    </div>
                </div>

                <div className="info-alert">
                    Los participantes se agregarán después de crear el torneo.
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