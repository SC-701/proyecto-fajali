import { appsettings } from "../settings/appsettings";



export async function registerUser(username, password,email) {
    try {

        const response = await fetch(`${appsettings.apiUrl}Usuarios/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',

            },
            body: JSON.stringify({ username, password,email }),
        });

        const data = await response.json();





        if (!response.ok) {
            return { success: false, error: data.error };
        }

        if (data.error) {
            return { success: false, error: data.error };
        }


        return { success: true };
    } catch (err) {
        return { success: false, error: err };
    }
} 