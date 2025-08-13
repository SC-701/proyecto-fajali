using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo.Usuarios
{
    public class UsuariosFlujo : IUsuariosFlujo
    {
        private readonly IUsuariosDA _usuariosDA;

        public UsuariosFlujo(IUsuariosDA usuariosDA)
        {
            _usuariosDA = usuariosDA;
        }

        public async Task<bool> EditarUsuario(UserUI usuario)
        {
            var resultado = await _usuariosDA.EditarUsuario(usuario);
            if (resultado == null)
            {
                return false;
            }
            return resultado;
        }

        public Task<bool> EliminarUsuarioEnTorneo(RespuestaTorneo torneo, string idUsuario)
        {
          var resultado = _usuariosDA.EliminarUsuarioEnTorneo(torneo, idUsuario);
            return resultado;
        }

        public Task<bool> InscribirUsuarioTorneo(RespuestaTorneo torneo, string IdUsuario)
        {
            var resultado = _usuariosDA.InscribirUsuarioTorneo(torneo, IdUsuario);
            return resultado;
        }

        public Task<List<UserResponse>> ListarUsuarios()
        {
            var resultado = _usuariosDA.ListarUsuarios();
            return resultado;
        }

        public async Task<TokenDTO> Login(UserBase usuario)
        {
            var resultado =  await _usuariosDA.Login(usuario);
            return resultado;
        }

        public async Task<UserResponse?> ObtenerUsuarioPorId(string idUsuario)
        {
            var resultado = await _usuariosDA.ObtenerUsuarioPorId(idUsuario);
            if (resultado == null)
            {
                return null;
            }
            return resultado;
        }

        public async Task<bool> Register(UserRegister usuario)
        {
            var resultado = await _usuariosDA.Register(usuario);
            return resultado;
        }
    }
}
