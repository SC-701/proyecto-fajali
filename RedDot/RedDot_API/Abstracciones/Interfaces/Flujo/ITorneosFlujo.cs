using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.Flujo
{
    public interface ITorneosFlujo
    {
        Task<RespuestaTorneo> CrearTorneo(SolicitudCrearTorneo solicitud, string creadoPor);
        Task<bool> ActualizarPuntajePartido(SolicitudActualizarPuntaje solicitud, string nombreUsuario);
        Task<bool> AvanzarRonda(SolicitudAvanzarRonda solicitud, string nombreUsuario);
        Task<List<RespuestaTorneo>> ObtenerMisTorneos(string nombreUsuario, EstadoTorneo? estado = null);
        Task<RespuestaTorneo?> AccederTorneoConClave(string accessKey, string nombreUsuario);
        Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo, string nombreUsuario, string? accessKey = null);
        Task<RespuestaListaTorneos> ObtenerTorneos(int numeroPagina = 1, int tamanoPagina = 10, EstadoTorneo? estado = null, string? tipoDeporte = null);
        Task<bool> CambiarEstadoTorneo(string idTorneo, EstadoTorneo estado, string nombreUsuario);
        Task<bool> EliminarTorneo(string idTorneo, string nombreUsuario);
        Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo);
        Task<bool> AgregarParticipantesIndividuales(string idTorneo, List<string> participantesIds, string nombreUsuario);
        Task<bool> AgregarParticipantesEquipos(string idTorneo, List<Equipo> Equipos, string nombreUsuario);
    }
}