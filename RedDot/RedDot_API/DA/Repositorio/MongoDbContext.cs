using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos;
using DA.Entidades;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace DA.Repositorio
{
    internal class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        private readonly IConfiguration _configuracion;
        public IMongoCollection<User> Users { get; }
        public IMongoCollection<Roles> Roles { get; }
        public IMongoCollection<Role_users> Roles_Users { get; }

        public MongoDbContext(IConfiguration configuration)
        {
            _configuracion = configuration;

            var client = new MongoClient(_configuracion.GetSection("RedDotDatabase:ConnectionString").Value);

            _database = client.GetDatabase(_configuracion.GetSection("RedDotDatabase:DatabaseName").Value);


            Users = _database.GetCollection<User>("users");
            Roles = _database.GetCollection<Roles>("roles");
            Roles_Users = _database.GetCollection<Role_users>("roles_users");
        }
    }
}
