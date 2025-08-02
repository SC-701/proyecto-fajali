using System.Security.Claims;
using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using DA.Entidades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TorneosController : ControllerBase, ITorneosController
    {
        private readonly ITorneosFlujo _torneosFlujo;
        private readonly IUsuariosFlujo _usuariosFlujo;

        public TorneosController(ITorneosFlujo torneosFlujo, IUsuariosFlujo usuariosFlujo)
        {
            _torneosFlujo = torneosFlujo;
            _usuariosFlujo = usuariosFlujo;
        }

        [HttpPost("eliminacion/crear")]
        public async Task<ActionResult> CrearTorneoEliminacion([FromBody] SolicitudCrearTorneoEliminacion solicitud)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nombreUsuario = User.Identity?.Name;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var resultado = await _torneosFlujo.CrearTorneoEliminacion(solicitud, nombreUsuario);

                return Ok(new
                {
                    Mensaje = "Torneo de eliminación directa creado exitosamente",
                    IdTorneo = resultado.Id,
                    AccessKey = resultado.AccessKey
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPut("eliminacion/puntaje")]
        public async Task<ActionResult> ActualizarPuntaje([FromBody] SolicitudActualizarPuntaje solicitud)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nombreUsuario = User.Identity?.Name;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var resultado = await _torneosFlujo.ActualizarPuntajePartido(solicitud, nombreUsuario);

                if (!resultado)
                {
                    return BadRequest("No se pudo actualizar el puntaje");
                }

                return Ok(new { Mensaje = "Puntaje actualizado exitosamente" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("eliminacion/avanzar")]
        public async Task<ActionResult> AvanzarRonda([FromBody] SolicitudAvanzarRonda solicitud)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nombreUsuario = User.Identity?.Name;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var resultado = await _torneosFlujo.AvanzarRonda(solicitud, nombreUsuario);

                if (!resultado)
                {
                    return BadRequest("No se pudo avanzar de ronda");
                }

                return Ok(new { Mensaje = "Ronda avanzada exitosamente" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("mis-torneos-eliminacion")]
        public async Task<ActionResult> ObtenerMisTorneosEliminacion(
            [FromQuery] EstadoTorneo? estado = null)
        {
            try
            {
                var nombreUsuario = User.Identity?.Name;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var torneos = await _torneosFlujo.ObtenerMisTorneosEliminacion(nombreUsuario, estado);
                return Ok(torneos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("eliminacion/acceder")]
        public async Task<ActionResult> AccederConClave([FromBody] SolicitudAccesoConClave solicitud)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nombreUsuario = User.Identity?.Name;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var torneo = await _torneosFlujo.AccederTorneoConClave(solicitud.AccessKey, nombreUsuario);

                if (torneo == null)
                {
                    return NotFound("Clave de acceso inválida");
                }

                return Ok(torneo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("eliminacion/{idTorneo}")]
        public async Task<ActionResult> ObtenerTorneoEliminacion(string idTorneo, [FromQuery] string? accessKey = null)
        {
            try
            {
                var nombreUsuario = User.Identity?.Name;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var torneo = await _torneosFlujo.ObtenerTorneoEliminacion(idTorneo, nombreUsuario, accessKey);

                if (torneo == null)
                {
                    return NotFound("Torneo no encontrado o acceso denegado");
                }

                return Ok(torneo);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid("No tienes permisos para acceder a este torneo");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("crear")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CrearTorneo([FromBody] SolicitudCrearTorneo torneo)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nombreUsuario = User.Identity?.Name;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var idTorneo = await _torneosFlujo.CrearTorneo(torneo, nombreUsuario);

                return Ok(new
                {
                    Mensaje = "Torneo creado exitosamente",
                    IdTorneo = idTorneo
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPut("actualizar")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ActualizarTorneo([FromBody] SolicitudActualizarTorneo torneo)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nombreUsuario = User.Identity?.Name;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var resultado = await _torneosFlujo.ActualizarTorneo(torneo, nombreUsuario);

                if (!resultado)
                {
                    return BadRequest("No se pudo actualizar el torneo");
                }

                return Ok(new { Mensaje = "Torneo actualizado exitosamente" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpDelete("eliminar/{idTorneo}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> EliminarTorneo(string idTorneo)
        {
            try
            {
                var nombreUsuario = User.Identity?.Name;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var resultado = await _torneosFlujo.EliminarTorneo(idTorneo, nombreUsuario);

                if (!resultado)
                {
                    return BadRequest("No se pudo eliminar el torneo");
                }

                return Ok(new { Mensaje = "Torneo eliminado exitosamente" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("obtener/{idTorneo}")]
        public async Task<ActionResult> ObtenerTorneoPorId(string idTorneo)
        {
            try
            {
                var torneo = await _torneosFlujo.ObtenerTorneoPorId(idTorneo);

                if (torneo == null)
                {
                    return NotFound("Torneo no encontrado");
                }

                return Ok(torneo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("listar")]
        public async Task<ActionResult> ObtenerTorneos(
            [FromQuery] int numeroPagina = 1,
            [FromQuery] int tamanoPagina = 10,
            [FromQuery] EstadoTorneo? estado = null,
            [FromQuery] string? tipoDeporte = null)
        {
            try
            {
                var torneos = await _torneosFlujo.ObtenerTorneos(numeroPagina, tamanoPagina, estado, tipoDeporte);
                return Ok(torneos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("mis-torneos")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ObtenerMisTorneos()
        {
            try
            {
                var nombreUsuario = User.Identity?.Name;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var torneos = await _torneosFlujo.ObtenerMisTorneos(nombreUsuario);
                return Ok(torneos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("LeaderBoardPorTorneo/{idTorneo}")]
        public Task<LeaderBoardPorTorneo> LeaderBoardPorTorneo(string idTorneo)
        {
            var resultado = _torneosFlujo.LeaderBoardPorTorneo(idTorneo);
            if (resultado == null)
            {
                throw new ArgumentException("El torneo no existe");
            }
            return resultado;
        }

        [HttpPatch("cambiar-estado")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CambiarEstadoTorneo([FromBody] SolicitudCambiarEstado solicitud)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nombreUsuario = User.Identity?.Name;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var resultado = await _torneosFlujo.CambiarEstadoTorneo(solicitud.IdTorneo, solicitud.NuevoEstado, nombreUsuario);

                if (!resultado)
                {
                    return BadRequest("No se pudo cambiar el estado del torneo");
                }

                return Ok(new { Mensaje = "Estado del torneo actualizado exitosamente" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPatch("AgregarParticipantes/{idTorneo}")]
        public async Task<ActionResult> AgregarParticipantes([FromBody] ParticipantesBase Participantes, [FromRoute] string idTorneo)
        {
            var torneo = await _torneosFlujo.ObtenerTorneoPorId(idTorneo);
            if (torneo == null)
                return NotFound("Torneo no encontrado");

            var resultado = await _torneosFlujo.AgregarParticipantes(Participantes, idTorneo);
            if (!resultado)
                return BadRequest("No se pudo agregar al participante");

            var usuariosIds = ObtenerIdsUsuariosDesdeParticipante(Participantes);

            foreach (var idUsuario in usuariosIds)
            {
                var inscrito = await _usuariosFlujo.InscribirUsuarioTorneo(torneo, idUsuario);
                if (!inscrito)
                    return BadRequest($"No se pudo inscribir al usuario {idUsuario} al torneo");
            }

            return Ok(new { Mensaje = "Participante agregado exitosamente" });
        }

        [HttpDelete("EliminarMienbroEquipo/{idUsuario}/{idTorneo}/{NombreEquipo}")]
        public async Task<ActionResult> EliminarMienbroEquipo(string idTorneo, string NombreEquipo, string idUsuario)
        {
            var resultado = await _torneosFlujo.EliminarMienbroEquipo(idTorneo, NombreEquipo, idUsuario);
            if (!resultado)
                return BadRequest("No se pudo eliminar el participante");
            var torneo = await _torneosFlujo.ObtenerTorneoPorId(idTorneo);
            var eliminar = await _usuariosFlujo.EliminarUsuarioEnTorneo(torneo, idUsuario);
            return Ok(new { Mensaje = "Participante eliminado exitosamente" });
        }

        [HttpDelete("EliminarEquipo/{idTorneo}/{NombreEquipo}")]
        public async Task<ActionResult> EliminarEquipo(string idTorneo, string NombreEquipo)
        {
            var torneo = await _torneosFlujo.ObtenerTorneoPorId(idTorneo);
            if (torneo == null)
                return NotFound("Torneo no encontrado");

            var equipoEliminado = torneo.Participantes
                .OfType<Equipo>()
                .FirstOrDefault(e => e.NombreEquipo == NombreEquipo);

            if (equipoEliminado == null)
                return NotFound("Equipo no encontrado");

            var usuariosIds = ObtenerIdsUsuariosDesdeParticipante(equipoEliminado);

            // Eliminar el equipo
            var resultado = await _torneosFlujo.EliminarEquipo(idTorneo, NombreEquipo);
            if (!resultado)
                return BadRequest("No se pudo eliminar el Equipo");

            foreach (var idUsuario in usuariosIds)
            {
                var desinscrito = await _usuariosFlujo.EliminarUsuarioEnTorneo(torneo, idUsuario);
                if (!desinscrito)
                    return BadRequest($"No se pudo desinscribir al usuario {idUsuario} del torneo");
            }

            return Ok(new { Mensaje = "Equipo eliminado exitosamente" });
        }

        [HttpDelete("EliminarParticipante/{idTorneo}/{IdUsuario}")]
        public async Task<ActionResult> EliminarParticipante(string idTorneo, string IdUsuario)
        {
            var resultado = await _torneosFlujo.EliminarParticipante(idTorneo, IdUsuario);

            if (!resultado)
                return BadRequest("No se pudo eliminar el participante");
            var torneo = await _torneosFlujo.ObtenerTorneoPorId(idTorneo);
            var eliminar = await _usuariosFlujo.EliminarUsuarioEnTorneo(torneo, IdUsuario);

            return Ok(new { Mensaje = "Participante eliminado exitosamente" });
        }

        private List<string> ObtenerIdsUsuariosDesdeParticipante(ParticipantesBase participante)
        {
            var ids = new List<string>();

            switch (participante)
            {
                case ParticipanteIndividual individual:
                    if (!string.IsNullOrEmpty(individual.UsuarioId))
                        ids.Add(individual.UsuarioId);
                    break;

                case Equipo equipo:
                    if (equipo.Integrantes != null)
                    {
                        ids.AddRange(equipo.Integrantes
                            .Where(i => !string.IsNullOrEmpty(i.UsuarioId))
                            .Select(i => i.UsuarioId));
                    }
                    break;
            }

            return ids;
        }
    }
}