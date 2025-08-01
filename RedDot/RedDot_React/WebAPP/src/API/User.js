import ApiService from '../services/apiService.js';

export async function getUserProfile(profileId) {
    return await ApiService.getWithParams('Usuarios/ObtenerUsuario',{idUsuario:profileId});
}

export async function updateUserProfile(profileData) {
    return await ApiService.put('Usuarios/EditarUsuario', profileData);
}





export async function getDashboardStats() {
    return await ApiService.get('Dashboard/stats');
}

