"use client"
import { Link } from "react-router-dom"
import { useState } from "react"
import "../styles/Login.css"
import { useAuth } from "../context/AuthContext.jsx"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    const navigate = useNavigate()
    const { login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const result = await login(formData.username, formData.password);

        if (!result.success) {
            Swal.fire({
                icon: "error",
                title: result.error[0].title || "Error",
                text: result.error[0].errorData?.message || "Error de autenticación",
                confirmButtonColor: "#d33",
            })
            return
        } else {
            Swal.fire({
                icon: "success",
                title: "¡Bienvenido!",
                text: "Inicio de sesión exitoso",
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                navigate("/dashboard")
            })
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="app-title">RedDot</h1>
                    <p className="app-subtitle">Gestión de Torneos Deportivos</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <h2 className="form-title">Iniciar Sesión</h2>

                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Usuario
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="form-input"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Contraseña
                        </label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="Tu contraseña"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-button">
                        Iniciar Sesión
                    </button>

                    <div className="form-footer">
                        <p>
                            ¿No tienes cuenta?{" "}
                            <Link to="/register" className="login-link">Registrate Aqui</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login