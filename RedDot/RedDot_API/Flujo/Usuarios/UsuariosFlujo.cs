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
        public async Task<TokenDTO> Login(UserBase usuario)
        {
            var resultado =  await _usuariosDA.Login(usuario);
            return resultado;
        }

        public async Task<bool> Register(UserRegister usuario)
        {
            var resultado = await _usuariosDA.Register(usuario);
            return resultado;
        }
    }
}
