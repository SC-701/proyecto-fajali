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
        Task<string> CrearTorneo(SolicitudCrearTorneo solicitud);
        Task<bool> ActualizarPuntajePartido(string idTorneo, string ronda, int indicePartido, List<Participante> participantes);
        Task<bool> AvanzarRondaTorneo(string idTorneo, string rondaActual);
        Task<List<RespuestaTorneo>> ObtenerTorneosPorUsuario(string nombreUsuario, int estado = 0);
        Task<RespuestaTorneo?> ObtenerTorneoPorAccessKey(string accessKey);
        Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo);
        Task<RespuestaListaTorneos> ObtenerTorneos(string id,int numeroPagina = 1, int tamanoPagina = 10, int estado = 0, string? tipoDeporte = null);
        Task<bool> ActualizarEstadoTorneo(string idTorneo, int estado);
        Task<bool> EliminarTorneo(string idTorneo);
        Task<bool> ExisteTorneo(string idTorneo);
        Task<bool> UsuarioTieneAccesoTorneo(string idTorneo, string nombreUsuario);
        Task<bool> AgregarJugadorATorneo(string idTorneo, int numeroPartido, Equipo equipo, string fase);

    }
}