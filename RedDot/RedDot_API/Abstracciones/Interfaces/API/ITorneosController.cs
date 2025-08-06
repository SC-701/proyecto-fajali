using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface ITorneosController
    {
        Task<ActionResult> CrearTorneo(SolicitudCrearTorneo solicitud);
        Task<ActionResult> ActualizarPuntaje(SolicitudActualizarPuntaje solicitud);
        Task<ActionResult> AvanzarRonda(SolicitudAvanzarRonda solicitud);
        Task<ActionResult> ObtenerMisTorneos(EstadoTorneo? estado = null);
        Task<ActionResult> AccederConClave(SolicitudAccesoConClave solicitud);
        Task<ActionResult> ObtenerTorneo(string idTorneo, string? accessKey = null);
        Task<ActionResult> ObtenerTorneos(int numeroPagina = 1, int tamanoPagina = 10, EstadoTorneo? estado = null, string? tipoDeporte = null);
        Task<ActionResult> EliminarTorneo(string idTorneo);
        Task<ActionResult> CambiarEstadoTorneo(SolicitudCambiarEstado solicitud);
        Task<ActionResult> ObtenerTorneoPorId(string idTorneo);
        Task<ActionResult> ObtenerCategorias();
        Task<ActionResult> AgregarParticipantesIndividuales(string idTorneo, List<string> participantesIds, string nombreUsuario);
        Task<ActionResult> AgregarParticipantesEquipos(string idTorneo, List<Equipo> Equipos, string nombreUsuario);
    }
}