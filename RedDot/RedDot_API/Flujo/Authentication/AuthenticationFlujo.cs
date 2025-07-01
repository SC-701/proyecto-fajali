using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;

namespace Flujo.Authentication
{
    public class AuthenticationFlujo : IAuthenticationFlujo
    {
        private readonly IAuthenticationDA _authenticationDA;

        public AuthenticationFlujo(IAuthenticationDA authenticationDA)
        {
            _authenticationDA = authenticationDA;
        }
        public Task<string> GetRole(string username)
        {
           
            return _authenticationDA.GetRole(username);
        }
    }
}
