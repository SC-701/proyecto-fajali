using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.DA
{
    public interface ITorneosDA
    {
        Task<string> CrearTorneo(SolicitudCrearTorneo torneo, string creadoPor);
        Task<bool> ActualizarTorneo(SolicitudActualizarTorneo torneo);
        Task<bool> EliminarTorneo(string idTorneo);
        Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo);
        Task<RespuestaListaTorneos> ObtenerTorneos(int numeroPagina = 1, int tamanoPagina = 10, EstadoTorneo? estado = null, string? tipoDeporte = null);
        Task<List<RespuestaTorneo>> ObtenerTorneosPorCreador(string creadoPor);
        Task<bool> ActualizarEstadoTorneo(string idTorneo, EstadoTorneo estado);
        Task<bool> ExisteTorneo(string idTorneo);
        Task<bool> AgregarParticipantes(ParticipantesBase Participantes, string idTorneo);
        Task<bool> EliminarMienbroEquipo(string idTorneo, string NombreEquipo,string idUsuario);
        Task<bool> EliminarEquipo(string idTorneo,string NombreEquipo);
        Task<bool> EliminarParticipante(string idTorneo, string IdUsuario);
   


    }
}
