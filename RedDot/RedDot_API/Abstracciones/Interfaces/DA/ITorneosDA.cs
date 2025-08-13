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
        Task<RespuestaTorneo?> CrearTorneo(SolicitudCrearTorneo solicitud);
        Task<bool> ActualizarPuntajePartido(string idTorneo, string ronda, int indicePartido, List<Participante> participantes, Partido match);
        Task<List<RespuestaTorneo>> ObtenerTorneosPorUsuario(string nombreUsuario, int estado = 0);
        Task<RespuestaTorneo?> ObtenerTorneoPorAccessKey(string accessKey,string id);
        Task<RespuestaListaTorneos> ObtenerTorneos(string id,int numeroPagina = 1, int tamanoPagina = 10, int estado = 0, string? tipoDeporte = null);
        Task<bool> ActualizarEstadoTorneo(string idTorneo, int estado);
        Task<List<RespuestaTorneo>> ObtenerTorneosParticipando(string idUsuario, int estado = 0);
        Task<bool> ActualizarMatch(MatchChangeRequest matchStatus);
        Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo);
        Task<RespuestaListaTorneos> TorneosActivos();

    }
}