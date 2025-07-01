using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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

    }
}
