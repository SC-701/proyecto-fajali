import ApiService from '../services/apiService.js';


export async function getAllTournaments(page = 1, pageSize = 10, state = null, sportType = null) {
    let url = `Torneos/listar?numeroPagina=${page}&tamanoPagina=${pageSize}`;
    if (state !== null) url += `&estado=${state}`;
    if (sportType) url += `&tipoDeporte=${sportType}`;
    return await ApiService.get(url);
}

export async function createTournament(tournamentData) {
    return await ApiService.post('Torneos/crear', tournamentData);
}

export async function getCategorias() {
    return await ApiService.get('Torneos/categorias');
}
export async function getActiveTournaments() {
    return await ApiService.get('Torneos/TorneosActivos');
}

export async function getMyTournaments(state = null) {
    const params = state !== null ? `?estado=${state}` : '';
    return await ApiService.get(`Torneos/mis-torneos${params}`);
}

export async function getParticipatingTournaments(state = null) {
    const params = state !== null ? `?estado=${state}` : '';
    return await ApiService.get(`Torneos/participando${params}`);
}

export async function getTournament(id, accessKey = null) {
    const params = accessKey ? `?accessKey=${accessKey}` : '';
    return await ApiService.get(`Torneos/${id}${params}`);
}

export async function updateMatchScore(scoreData) {
    return await ApiService.put('Torneos/puntaje', scoreData);
}

export async function accessTournamentWithKey(accessKey) {
    return await ApiService.post('Torneos/acceder', { accessKey });
}

export async function getSportName() {

    return await ApiService.getWithParams('Torneos/deportes');
}

export const getStateName = (state) => {
    const names = ['Por Iniciar', 'En Progreso', 'Terminado', 'Cancelado'];
    return names[state] || 'Desconocido';
};

export async function changeTournamentStatus(tournamentId, newStatus) {
    return await ApiService.put('Torneos/cambiar-estado', {
        idTorneo: tournamentId,
        nuevoEstado: newStatus
    });
}

export async function changeMatchStatus (matchStatus) {
    return await ApiService.put('Torneos/actualizar-match', matchStatus);
}

export async function getParticipatingActiveTournaments() {
    return await ApiService.get('Torneos/participando-activos');
}

export async function getParticipatingCompletedTournaments() {
    return await ApiService.get('Torneos/participando-completados');
}