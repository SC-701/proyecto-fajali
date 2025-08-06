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
        Task<string> CrearTorneo(SolicitudCrearTorneo solicitud, string creadoPor);
        Task<bool> ActualizarPuntajePartido(string idTorneo, string ronda, int indicePartido, List<Participante> participantes);
        Task<bool> AvanzarRondaTorneo(string idTorneo, string rondaActual);
        Task<List<RespuestaTorneo>> ObtenerTorneosPorUsuario(string nombreUsuario, EstadoTorneo? estado = null);
        Task<RespuestaTorneo?> ObtenerTorneoPorAccessKey(string accessKey);
        Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo);
        Task<RespuestaListaTorneos> ObtenerTorneos(int numeroPagina = 1, int tamanoPagina = 10, EstadoTorneo? estado = null, string? tipoDeporte = null);
        Task<bool> ActualizarEstadoTorneo(string idTorneo, EstadoTorneo estado);
        Task<bool> EliminarTorneo(string idTorneo);
        Task<bool> ExisteTorneo(string idTorneo);
        Task<bool> UsuarioTieneAccesoTorneo(string idTorneo, string nombreUsuario);
        Task<bool> AgregarParticipantesIndividuales(string idTorneo, List<string> participantesIds);
        Task<bool> AgregarParticipantesEquipos(string idTorneo, List<Equipo> Equipos);

    }
}