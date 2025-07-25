using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using DA.Entidades;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace DA.Repositorio
{
    public class MongoDbContext: IMongoDbContext
    {
      private readonly IMongoDatabase _database;

    public MongoDbContext(IMongoClient client, IConfiguration config)
    {
        _database = client.GetDatabase(config["RedDotDatabase:DatabaseName"]);
    }

    public IMongoCollection<T> GetCollection<T>(string nombreColeccion)
    {
        return _database.GetCollection<T>(nombreColeccion);
    }
    }
}
