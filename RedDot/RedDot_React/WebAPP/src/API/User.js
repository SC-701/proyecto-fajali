import ApiService from '../services/apiService.js';

export async function getUserProfile(profileId) {
    return await ApiService.getWithParams('Usuarios/ObtenerUsuario', { idUsuario: profileId });
}

export async function updateUserProfile(profileData) {
    return await ApiService.put('Usuarios/EditarUsuario', profileData);
}

export async function searchUsers(searchTerm) {
    // Por ahora retorna datos mock hasta queeste en el endpoint en la API
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: [
                    { id: '1', username: `User_${searchTerm}_1` },
                    { id: '2', username: `User_${searchTerm}_2` },
                    { id: '3', username: `User_${searchTerm}_3` }
                ]
            });
        }, 500);
    });
}

export async function getDashboardStats() {
    return await ApiService.get('Dashboard/stats');
}