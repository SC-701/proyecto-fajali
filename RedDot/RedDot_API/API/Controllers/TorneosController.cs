using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TorneosController : ControllerBase, ITorneosController
    {
        private readonly ITorneosFlujo _torneosFlujo;

        public TorneosController(ITorneosFlujo torneosFlujo)
        {
            _torneosFlujo = torneosFlujo;
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
    }
}
