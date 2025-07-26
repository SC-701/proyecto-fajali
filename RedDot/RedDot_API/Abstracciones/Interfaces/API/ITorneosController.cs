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
    }
}





