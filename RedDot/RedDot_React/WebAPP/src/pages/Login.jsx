/* eslint-disable no-unused-vars */
"use client"
import { Link } from "react-router-dom"
import { useState } from "react"
import "../styles/Login.css"
import { loginUser } from "../API/Login.js"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    const navigate = useNavigate()

    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
       
            const { success, error } = await loginUser(

                formData["username"],
                formData["password"]

            );
            if (!success) {
                Swal.fire({
                    icon: "error",
                    title: error[0].title || "Error",
                    text: error[0].errorData,
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
                    navigate("/home")
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
                            Correo Electrónico
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

                    <div className="form-options">
                        <label className="checkbox-container">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            Recordarme
                        </label>
                        <a href="#" className="forgot-password">
                            ¿Olvidaste tu contraseña?
                        </a>
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
