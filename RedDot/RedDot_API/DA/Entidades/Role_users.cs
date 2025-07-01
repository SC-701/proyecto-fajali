using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace Abstracciones.Modelos
{
    public class Role_users
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        
        [BsonRepresentation(BsonType.ObjectId)]
        public string IdRole { get; set; }

        
        [BsonRepresentation(BsonType.ObjectId)]
        public string IdUser { get; set; }
    }
}
