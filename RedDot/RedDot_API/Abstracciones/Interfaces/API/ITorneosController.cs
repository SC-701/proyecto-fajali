using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;


namespace Abstracciones.Interfaces.API
{
    public interface ITorneosController
    {
        Task<ActionResult> CrearTorneo(SolicitudCrearTorneo torneo);
        Task<ActionResult> ActualizarTorneo(SolicitudActualizarTorneo torneo);
        Task<ActionResult> EliminarTorneo(string idTorneo);
        Task<ActionResult> ObtenerTorneoPorId(string idTorneo);
        Task<ActionResult> ObtenerTorneos(int numeroPagina = 1, int tamanoPagina = 10, EstadoTorneo? estado = null, string? tipoDeporte = null);
        Task<ActionResult> ObtenerMisTorneos();
        Task<ActionResult> CambiarEstadoTorneo(SolicitudCambiarEstado solicitud);
        Task<ActionResult> AgregarParticipantes(ParticipantesBase Participantes , string idTorneo);
        Task<ActionResult> EliminarMienbroEquipo(string idTorneo, string NombreEquipo, string idUsuario);
        Task<ActionResult> EliminarEquipo(string idTorneo, string NombreEquipo);
        Task<ActionResult> EliminarParticipante(string idTorneo, string IdUsuario);


    }
}





