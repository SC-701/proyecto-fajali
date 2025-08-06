using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
   public class TokenDTO
    {
        public bool ValidationSuccess { get; set; }
        public string AccessToken { get; set; }

        public string user { get; set; } = string.Empty;
    }

    public class TokenConfiguration
    {
        [Required]
        [StringLength(100,MinimumLength = 32)]
        public string Key { get; set; }
        [Required]
        public string Issuer { get; set; }
        [Required]
        public double Expires { get; set; }
        public string Audience { get; set; }
    }

    
}
