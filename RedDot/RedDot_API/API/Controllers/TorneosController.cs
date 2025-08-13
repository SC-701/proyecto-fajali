using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class TorneosController : ControllerBase, ITorneosController
    {
        private readonly ITorneosFlujo _torneosFlujo;
        private readonly ICategoriasFlujo _categoriasFlujo;

        public TorneosController(ITorneosFlujo torneosFlujo, ICategoriasFlujo categoriasFlujo)
        {
            _torneosFlujo = torneosFlujo;
            _categoriasFlujo = categoriasFlujo;
        }

        [HttpPost("crear")]
        public async Task<ActionResult> CrearTorneo([FromBody] SolicitudCrearTorneo solicitud)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var resultado = await _torneosFlujo.CrearTorneo(solicitud);

                return Ok(new
                {
                    Mensaje = "Torneo creado exitosamente",
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
        
        [HttpPut("puntaje")]
        public async Task<ActionResult> ActualizarPuntaje([FromBody] SolicitudActualizarPuntaje solicitud)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nombreUsuario = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
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

        [HttpGet("mis-torneos")]
        public async Task<ActionResult> ObtenerMisTorneos([FromQuery] int estado = 0)
        {
            try
            {
                var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(id))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var torneos = await _torneosFlujo.ObtenerMisTorneos(id, estado);
                return Ok(torneos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("acceder")]
        public async Task<ActionResult> AccederConClave([FromBody] SolicitudAccesoConClave solicitud)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var usuario = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(usuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var torneo = await _torneosFlujo.AccederTorneoConClave(solicitud.AccessKey, usuario);

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

        [HttpGet("{idTorneo}")]
        public async Task<ActionResult> ObtenerTorneo(string idTorneo, [FromQuery] string? accessKey = null)
        {
            try
            {
                var nombreUsuario = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(nombreUsuario))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var torneo = await _torneosFlujo.ObtenerTorneoPorId(idTorneo, nombreUsuario, accessKey);

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

        [HttpGet("listar")]
        public async Task<ActionResult> ObtenerTorneos(
            [FromQuery] int numeroPagina = 1,
            [FromQuery] int tamanoPagina = 10,
            [FromQuery] int estado = 0,
            [FromQuery] string? tipoDeporte = null)
        {
            try
            {
                var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var torneos = await _torneosFlujo.ObtenerTorneos(id, numeroPagina, tamanoPagina, estado, tipoDeporte);
                return Ok(torneos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        

        [HttpPut("cambiar-estado")]
        public async Task<ActionResult> CambiarEstadoTorneo([FromBody] SolicitudCambiarEstado solicitud)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nombreUsuario = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
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

     
        [HttpGet("categorias")]

        public async Task<ActionResult> ObtenerCategorias()
        {
            try
            {
                var categorias = await _categoriasFlujo.ObtenerCategorias();
                return Ok(categorias);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
        [HttpGet("participando")]
        public async Task<ActionResult> ObtenerTorneosParticipando([FromQuery] int estado = 0)
        {
            try
            {
                var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(id))
                {
                    return Unauthorized("No se pudo identificar al usuario");
                }

                var torneos = await _torneosFlujo.ObtenerTorneosParticipando(id, estado);
                return Ok(torneos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("deportes")]
        public async Task<ActionResult> ObtenerDeportes()
        {

            var deportes = await _categoriasFlujo.ObtenerDeportes();
            return Ok(deportes);
        }
     
        [HttpPut("actualizar-match")]
        public async Task<ActionResult> ActualizarMatch(MatchChangeRequest matchStatus)
        {
            var resultado = await _torneosFlujo.ActualizarMatch(matchStatus);
            if (resultado)
            {
                return Ok($"Match {matchStatus.matchIndex} actualizado exitosamente");
            }
            else
            {
                throw new Exception("No se pudo actualizar el match");
            }
        }
        [HttpGet("TorneosActivos")]
        public async Task<ActionResult> TorneosActivos()
        {
            var resultado = await _torneosFlujo.TorneosActivos();
            return Ok(resultado);
        }
    }
}