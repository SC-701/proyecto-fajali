using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DA.Entidades
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonElement("username")]
        public string UserName { get; set; }
        [BsonElement("password_hash")]
        public string Password { get; set; }
        [BsonElement("email")]
        public string Email { get; set; }
        [BsonElement("torneos")]
        public List<string> Torneos { get; set; }
        [BsonElement("descripcion")]
        public string Descripcion { get; set; } = string.Empty;
        [BsonElement("tournaments_won")]
        public int TournamentsWon { get; set; } = 0;
        [BsonElement("tournaments_joined")]
        public int TournamentsJoined { get; set; } = 0;

    }
}
