import { appsettings } from "../settings/appsettings";



export async function loginUser(username, password) {
    try {

        const response = await fetch(`${appsettings.apiUrl}Usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',

            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();



      

        if (!response.ok) {
            return { success: false, error: [{errorData : data,title:"Inicio de sesión fallido"}] 
             };
        }


        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("token", data.accessToken);

        return { success: true };
    } catch (err) {
        return { success: false, error: [{errorData : err,title:"Error de servidor"}] };
    }
} 