import { useState, useEffect } from 'react';
import {
    getMyTournaments,
    getAllTournaments,
    getSportName,
    accessTournamentWithKey
} from '../../API/Tournament.js';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../UI/LoadingSpinner.jsx';
import CreateTournamentModal from './CreateTournamentModal.jsx';
import AccessKeyModal from './AccessKeyModal.jsx';
import TournamentCard from './TournamentCard.jsx';
import '../../styles/TournamentManager.css';

const TournamentManager = ({ onTournamentSelect }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({
        state: null,
        sportType: ''
    });
    const [sportName, setSportName] = useState([]);

    const { user } = useAuth();

    useEffect(() => {
        loadTournaments();
        loadSportName();
    }, [activeTab, currentPage, filter]);

    const loadTournaments = async () => {
        setLoading(true);
        try {
            let result;
            if (activeTab === 'mine') {
                result = await getMyTournaments(filter.state);
                setTournaments(result.success ? (result.data || []) : []);
                setTotalPages(1);
            } else {
                result = await getAllTournaments(
                    currentPage,
                    10,
                    filter.state,
                    filter.sportType || null
                );
                setTournaments(result.success ? (result.data.torneos || []) : []);
                setTotalPages(result.success ? (result.data.totalPaginas || 1) : 1);
            }
        } catch (error) {
            console.error("Error loading tournaments:", error);
            setTournaments([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSportName = async () => {
        try {
            const result = await getSportName();
            if (result.success) {
                setSportName(result.data);
            } else {
                throw new Error(result.error || 'Error al obtener el nombre del deporte');
            }
        } catch (error) {
            console.error("Error loading sport name:", error);
            throw error;
        }
    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({
            ...prev,
            [name]: value === '' ? null : (name === 'state' ? parseInt(value) : value)
        }));
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleAccessWithKey = async (accessKeyValue) => {
        try {
            const result = await accessTournamentWithKey(accessKeyValue);
            if (result.success) {
                onTournamentSelect(result.data);
                return true;
            } else {
                throw new Error(result.error || 'Clave de acceso inválida');
            }
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="tournament-manager">
            <div className="tournament-controls">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Todos los Torneos
                    </button>
                    <button
                        className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mine')}
                    >
                        Mis Torneos
                    </button>
                </div>

                <div className="actions">
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        Crear Torneo
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowAccessModal(true)}>
                        Acceder con Clave
                    </button>
                </div>
            </div>

            <div className="filter-controls">
                <div className="filter">
                    <label>Estado:</label>
                    <select
                        name="state"
                        value={filter.state === null ? '' : filter.state}
                        onChange={handleFilterChange}
                    >
                        <option value="">Todos</option>
                        <option value={0}>Por Iniciar</option>
                        <option value={1}>Cuartos</option>
                        <option value={2}>Semifinal</option>
                        <option value={3}>Final</option>
                        <option value={4}>Terminado</option>
                    </select>
                </div>

                {activeTab === 'all' && (
                    <div className="filter">
                        <label>Deporte:</label>
                        <select
                            name="sportType"
                            value={filter.sportType}
                            onChange={handleFilterChange}
                        >
                            <option value="">Todos</option>
                            {sportName.map((sport, index) => (
                                <option key={index} value={sport.nombre}>
                                    {sport.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : tournaments.length === 0 ? (
                <div className="no-tournaments">
                    <p>No hay torneos disponibles</p>
                </div>
            ) : (
                <>
                    <div className="tournaments-grid">
                        {tournaments.map(tournament => (
                            <TournamentCard
                                key={tournament.id}
                                tournament={tournament}
                                onSelect={onTournamentSelect}
                                onJoin={handleAccessWithKey}
                            />
                        ))}
                    </div>

                    {activeTab === 'all' && totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </button>
                            <span>
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}

            {showCreateModal && (
                <CreateTournamentModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={loadTournaments}
                />
            )}

            {showAccessModal && (
                <AccessKeyModal
                    onClose={() => setShowAccessModal(false)}
                    onSuccess={handleAccessWithKey}
                />
            )}
        </div>
    );
};

export default TournamentManager;