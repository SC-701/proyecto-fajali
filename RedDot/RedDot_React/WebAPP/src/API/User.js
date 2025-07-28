import ApiService from '../services/apiService.js';

export async function getUserProfile() {
    return await ApiService.get('Usuarios/profile');
}

export async function updateUserProfile(profileData) {
    return await ApiService.put('Usuarios/profile', profileData);
}

export async function getUserStats() {
    return await ApiService.get('Usuarios/stats');
}

export async function getUserActivity() {
    return await ApiService.get('Usuarios/activity');
}

export async function getDashboardStats() {
    return await ApiService.get('Dashboard/stats');
}

