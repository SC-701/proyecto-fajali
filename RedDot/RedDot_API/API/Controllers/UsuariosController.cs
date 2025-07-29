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
