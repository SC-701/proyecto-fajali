using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface IUsuariosController
    {
        Task<ActionResult> Login(UserBase usuario);
        Task<ActionResult> Register(UserRegister usuario);
        Task<ActionResult> EditarUsuario(UserUI usuario);
        Task<ActionResult<UserResponse?>> ObtenerUsuarioPorId(string idUsuario);
    }
}
