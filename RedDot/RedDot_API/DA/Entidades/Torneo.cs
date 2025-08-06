using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Abstracciones.Modelos;

namespace DA.Entidades
{
    public class Torneo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("nombre")]
        public string Nombre { get; set; }

        [BsonElement("descripcion")]
        public string Descripcion { get; set; }

        [BsonElement("reglas")]
        public string? Reglas { get; set; }


        [BsonElement("fecha_inicio")]
        public DateTime? FechaInicio { get; set; }

        [BsonElement("cupos_maximos")]
        public int? CuposMaximos { get; set; }

        [BsonElement("estado")]
        public int Estado { get; set; } 

        [BsonElement("creado_por")]
        public string CreadoPor { get; set; }

        [BsonElement("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [BsonElement("tipo_deporte")]
        public string TipoDeporte { get; set; }

        [BsonElement("ubicacion")]
        public string? Ubicacion { get; set; }

        [BsonElement("descripcion_premio")]
        public string? DescripcionPremio { get; set; }

        [BsonElement("participantes")]
        public List<ParticipantesBase>? Participantes { get; set; }

        [BsonElement("categoria")]
        public int Categoria { get; set; }

        [BsonElement("access_key")]
        public string? AccessKey { get; set; }

        [BsonElement("rondas")]
        public Rondas? Rondas { get; set; }


       
    }
}