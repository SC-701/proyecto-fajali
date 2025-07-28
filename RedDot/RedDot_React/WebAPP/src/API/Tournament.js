import ApiService from '../services/apiService.js';

export async function getAllTournaments() {
    return await ApiService.get('Torneos');
}

export async function getTournamentById(id) {
    return await ApiService.get(`Torneos/${id}`);
}

export async function createTournament(tournamentData) {
    return await ApiService.post('Torneos', tournamentData);
}

export async function updateTournament(id, tournamentData) {
    return await ApiService.put(`Torneos/${id}`, tournamentData);
}

export async function deleteTournament(id) {
    return await ApiService.delete(`Torneos/${id}`);
}

export async function joinTournament(tournamentId) {
    return await ApiService.post(`Torneos/${tournamentId}/join`);
}

export async function leaveTournament(tournamentId) {
    return await ApiService.delete(`Torneos/${tournamentId}/leave`);
}

export async function getLeaderboard(tournamentId) {
    return await ApiService.get(`Torneos/${tournamentId}/leaderboard`);
}

export async function updateTournamentResults(tournamentId, results) {
    return await ApiService.post(`Torneos/${tournamentId}/results`, results);
}