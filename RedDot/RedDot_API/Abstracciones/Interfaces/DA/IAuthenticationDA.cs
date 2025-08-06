using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Interfaces.DA
{
    public interface IAuthenticationDA
    {
        
        Task<string> GetRole(string username);
    }
}
