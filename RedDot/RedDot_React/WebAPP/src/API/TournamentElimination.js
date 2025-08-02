import ApiService from '../services/apiService.js';



export async function createEliminationTournament(tournamentData) {
    return await ApiService.post('Torneos/eliminacion/crear', tournamentData);
}

export async function getMyEliminationTournaments(state = null) {
    const params = state ? `?estado=${state}` : '';
    return await ApiService.get(`Torneos/mis-torneos-eliminacion${params}`);
}

export async function getEliminationTournament(id, accessKey = null) {
    const params = accessKey ? `?accessKey=${accessKey}` : '';
    return await ApiService.get(`Torneos/eliminacion/${id}${params}`);
}

export async function updateMatchScore(scoreData) {
    return await ApiService.put('Torneos/eliminacion/puntaje', scoreData);
}

export async function advanceRound(roundData) {
    return await ApiService.post('Torneos/eliminacion/avanzar', roundData);
}

export async function accessTournamentWithKey(accessKey) {
    return await ApiService.post('Torneos/eliminacion/acceder', { accessKey });
}


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