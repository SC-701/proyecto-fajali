import { appsettings } from "../settings/appsettings.js";

class ApiService {
    static getAuthHeaders() {
        const token = localStorage.getItem("token");
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    static async request(endpoint, options = {}) {
        const url = `${appsettings.apiUrl}${endpoint}`;

        const config = {
            headers: this.getAuthHeaders(),
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: [{ errorData: data, title: data.message || "Error en la solicitud" }],
                    status: response.status
                };
            }

            return { success: true, data };
        } catch (err) {
            return {
                success: false,
                error: [{ errorData: err, title: "Error de servidor" }]
            };
        }
    }

    static get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    static put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    static delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export default ApiService;