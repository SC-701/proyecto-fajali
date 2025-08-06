using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IUsuariosDA
    {
        Task<TokenDTO> Login(UserBase usuario);
        Task<bool> Register(UserRegister usuario);
        Task<bool> InscribirUsuarioTorneo(RespuestaTorneo torneo , string IdUsuario);
        Task<bool> EliminarUsuarioEnTorneo(RespuestaTorneo torneo, string idUsuario);
        Task<bool> EditarUsuario(UserUI usuario);
        Task<UserResponse?> ObtenerUsuarioPorId(string idUsuario);



    }
}
