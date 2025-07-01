using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace Abstracciones.Modelos
{
    public class UserBase
    {

    
        [Required(ErrorMessage = "UserName is required")]
        [StringLength(100, ErrorMessage = "UserName cannot be longer than 100 characters")]
        
        public string UserName { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, ErrorMessage = "Password cannot be longer than 100 characters")]
        
        public string Password { get; set; }
        
      
    }

    public class UserRegister : UserBase
    {

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        
        public string Email { get; set; }

    }
}

