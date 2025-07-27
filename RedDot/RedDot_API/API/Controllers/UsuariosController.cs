using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase, IUsuariosController
    {
        private readonly IUsuariosFlujo _usuariosFlujo;
        private readonly ITorneosFlujo _torneosFlujo;
        public UsuariosController(IUsuariosFlujo usuariosFlujo, ITorneosFlujo torneosFlujo = null)
        {
            _usuariosFlujo = usuariosFlujo;
            _torneosFlujo = torneosFlujo;
        }
        [HttpDelete("EliminarUsuarioEnTorneo/{idTorneo}/{idUsuario}")]
        public async Task<ActionResult> EliminarUsuarioEnTorneo(string idTorneo, string idUsuario)
        {
            var torneo = await _torneosFlujo.ObtenerTorneoPorId(idTorneo);
            if (torneo == null)
                return NotFound("Torneo no encontrado");

            var resultado = await _usuariosFlujo.EliminarUsuarioEnTorneo(torneo, idUsuario);
            if (!resultado)
                return NotFound("Usuario o torneo no encontrado");
            return Ok("Usuario eliminado del torneo correctamente");

        }
        [HttpPost("InscribirUsuarioTorneo/{idTorneo}/{IdUsuario}")]
        public async Task<ActionResult> InscribirUsuarioTorneo(string idTorneo, string IdUsuario)
        {
            var torneo = await _torneosFlujo.ObtenerTorneoPorId(idTorneo);
            if (torneo == null)
                return NotFound("Torneo no encontrado");

            var resultado = await _usuariosFlujo.InscribirUsuarioTorneo(torneo, IdUsuario);
            if (!resultado)
            {
                return NotFound("Usuario o torneo no encontrado");
            }
            return Ok("Usuario inscrito en el torneo correctamente");
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] UserBase usuario)
        {
            var resultado = await _usuariosFlujo.Login(usuario);

            if (resultado == null)
            {
                return NotFound("Usuario no encontrado");
            }
            if (!resultado.ValidationSuccess)
            {
                return Unauthorized("Credenciales incorrectas");
            }

            return Ok(resultado);
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] UserRegister usuario)
        {
            var resultado = await _usuariosFlujo.Register(usuario);

            if (!resultado)
            {
                return BadRequest("El usuario o email ya esta registrado");
            }

            return Ok("Usuario registrado correctamente");
        }
    }
}
