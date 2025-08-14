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
        private readonly ICategoriasFlujo _categoriasFlujo;
        public UsuariosController(IUsuariosFlujo usuariosFlujo, ICategoriasFlujo categoriasFlujo, ITorneosFlujo torneosFlujo = null)
        {
            _usuariosFlujo = usuariosFlujo;
            _torneosFlujo = torneosFlujo;
            _categoriasFlujo = categoriasFlujo;
        }
        [HttpPut("EditarUsuario")]
        public async Task<ActionResult> EditarUsuario([FromBody]UserUI usuario)
        {
            var resultado = await _usuariosFlujo.EditarUsuario(usuario);

            if (!resultado)
            {
                return BadRequest("Error al editar el usuario");
            }
            return Ok(resultado);
        }
        [HttpGet("ListarUsuarios")]
        public async Task<ActionResult> ListarUsuarios()
        {
            var usuarios = await _usuariosFlujo.ListarUsuarios();
            return Ok(usuarios.Count());
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
        [HttpGet("ObtenerUsuario")]
        public async Task<ActionResult<UserResponse?>> ObtenerUsuarioPorId([FromQuery]string idUsuario)
        {
            var resultado = await _usuariosFlujo.ObtenerUsuarioPorId(idUsuario);
            if (resultado == null)
            {
                return NotFound("Usuario no encontrado");
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
