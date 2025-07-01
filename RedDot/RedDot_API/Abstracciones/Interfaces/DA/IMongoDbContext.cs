using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace Abstracciones.Interfaces.DA
{
    public interface IMongoDbContext
    {
        IMongoCollection<T> GetCollection<T>(string nombreColeccion);
    }
}
