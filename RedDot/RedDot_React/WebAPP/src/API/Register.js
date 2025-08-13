import ApiService from '../services/apiService.js';

export async function registerUser(username, password, email) {
    const userData = {
        username,
        password,
        email
    };

    return await ApiService.post('Usuarios/register', userData);
}

export async function loginUser(username, password) {
    const loginData = {
        username,
        password
    };

    return await ApiService.post('Usuarios/login', loginData);
}




