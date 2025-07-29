using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos;


namespace Abstracciones.Interfaces.Flujo
{
    public interface ITorneosFlujo
    {
        Task<string> CrearTorneo(SolicitudCrearTorneo torneo, string creadoPor);
        Task<bool> ActualizarTorneo(SolicitudActualizarTorneo torneo, string nombreUsuario);
        Task<bool> EliminarTorneo(string idTorneo, string nombreUsuario);
        Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo);
        Task<RespuestaListaTorneos> ObtenerTorneos(int numeroPagina = 1, int tamanoPagina = 10, EstadoTorneo? estado = null, string? tipoDeporte = null);
        Task<List<RespuestaTorneo>> ObtenerMisTorneos(string nombreUsuario);
        Task<bool> CambiarEstadoTorneo(string idTorneo, EstadoTorneo estado, string nombreUsuario);
        Task<bool> AgregarParticipantes(ParticipantesBase Participantes, string idTorneo);
        Task<bool> EliminarMienbroEquipo(string idTorneo, string NombreEquipo, string idUsuario);
        Task<bool> EliminarEquipo(string idTorneo, string NombreEquipo);
        Task<bool> EliminarParticipante(string idTorneo, string IdUsuario);
        Task<LeaderBoardPorTorneo> LeaderBoardPorTorneo(string idTorneo);




    }
}