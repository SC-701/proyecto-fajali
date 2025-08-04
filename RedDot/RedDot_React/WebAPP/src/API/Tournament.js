import ApiService from '../services/apiService.js';

// UNIFICADO - Todos los torneos son de eliminación directa
export async function getAllTournaments(page = 1, pageSize = 10, state = null, sportType = null) {
    let url = `Torneos/listar?numeroPagina=${page}&tamanoPagina=${pageSize}`;
    if (state !== null) url += `&estado=${state}`;
    if (sportType) url += `&tipoDeporte=${sportType}`;
    return await ApiService.get(url);
}

export async function createTournament(tournamentData) {
    return await ApiService.post('Torneos/crear', tournamentData);
}

export async function getMyTournaments(state = null) {
    const params = state !== null ? `?estado=${state}` : '';
    return await ApiService.get(`Torneos/mis-torneos${params}`);
}

export async function getTournament(id, accessKey = null) {
    const params = accessKey ? `?accessKey=${accessKey}` : '';
    return await ApiService.get(`Torneos/${id}${params}`);
}

export async function updateMatchScore(scoreData) {
    return await ApiService.put('Torneos/puntaje', scoreData);
}

export async function advanceRound(roundData) {
    return await ApiService.post('Torneos/avanzar', roundData);
}

export async function accessTournamentWithKey(accessKey) {
    return await ApiService.post('Torneos/acceder', { accessKey });
}

export async function deleteTournament(id) {
    return await ApiService.delete(`Torneos/${id}`);
}

export async function getLeaderboard(tournamentId) {
    return await ApiService.get(`Torneos/LeaderBoard/${tournamentId}`);
}

// Estados y categorías
export const TournamentStates = {
    POR_INICIAR: 0,
    EN_PROGRESO: 1,
    TERMINADO: 2,
    CANCELADO: 3
};

export const TournamentCategories = {
    CONTACTO: 0,
    EQUIPO: 1,
    RAQUETA: 2,
    OTROS: 3
};

export const getCategoryName = (category) => {
    const names = ['Contacto', 'Equipo', 'Raqueta', 'Otros'];
    return names[category] || 'Desconocido';
};

export const getStateName = (state) => {
    const names = ['Por Iniciar', 'En Progreso', 'Terminado', 'Cancelado'];
    return names[state] || 'Desconocido';
};