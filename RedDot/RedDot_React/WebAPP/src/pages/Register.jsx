/* eslint-disable no-unused-vars */
"use client"

import { useState } from "react"
import "../styles/Register.css"
import { Link } from "react-router-dom"
import { registerUser } from "../API/Register.js"
import Swal from "sweetalert2"

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    
  })
  


  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
      try {
          const { success, error } = await registerUser(

              formData["username"],
              formData["password"],
              formData["email"]

          );
          if (!success) {
              Swal.fire({
                  icon: "error",
                  title: "Error del servidor",
                  text: error,
                  confirmButtonColor: "#d33",
              })
              return
          } else {
              Swal.fire({
                  icon: "success",
                  title: "Registro",
                  text: "Registro de usuario exitoso",
                  timer: 1500,
                  showConfirmButton: false,
              }).then(() => {
                  <Link to="/"></Link>
              })
          }




      } catch (error) {
          Swal.fire({
              icon: "error",
              title: "Error del servidor",
              text: error,
              confirmButtonColor: "#d33",
          })

      }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="app-title">RedDot</h1>
          <p className="app-subtitle">Gestión de Torneos Deportivos</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <h2 className="form-title">Crear Cuenta</h2>

          
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                          name="username"
                className="form-input"
                placeholder="Usuario"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
                      </div>
           

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          

          

          <div className="form-row">
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
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Contraseña
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              Acepto los términos y condiciones
            </label>
          </div>

          <button type="submit" className="register-button">
            Crear Cuenta
          </button>

          <div className="form-footer">
            <p>
              ¿Ya tienes cuenta?{" "}
                          <Link to="/" className="login-link">Inicia Sesión Aqui</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
