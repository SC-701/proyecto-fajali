using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;

namespace Abstracciones.Modelos
{
    public class UserBase
    {
        [Required(ErrorMessage = "El nombre de usuario es requerido")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "La contraseña es requerida")]
        public string Password { get; set; }

        public List<string> Torneos { get; set; } = new List<string>();
    }

    public class UserRegister : UserBase
    {
        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "El formato del email no es válido")]
        public string Email { get; set; }
    }

    public class UserUI
    {
        public string Id { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string description { get; set; }
       
    }

    public class UserResponse : UserUI
    {
        public int tournamentsWon { get; set; } = 0;
        public int tournamentsJoined { get; set; } = 0;

        public List<RespuestaTorneo> tournaments { get; set; } = default(List<RespuestaTorneo>); // Inicializar como lista vacía
    }

    

}