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

        [BsonElement("modalidad")]
        public string? Modalidad { get; set; }

        [BsonElement("fecha_inicio")]
        public DateTime? FechaInicio { get; set; }

        [BsonElement("fecha_fin")]
        public DateTime? FechaFin { get; set; }

        [BsonElement("fecha_limite_inscripcion")]
        public DateTime? FechaLimiteInscripcion { get; set; }

        [BsonElement("cupos_maximos")]
        public int? CuposMaximos { get; set; }

        [BsonElement("estado")]
        public EstadoTorneo Estado { get; set; } = EstadoTorneo.PorIniciar;

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
        public CategoriaTorneo? Categoria { get; set; }

        [BsonElement("access_key")]
        public string? AccessKey { get; set; }

        [BsonElement("rondas")]
        public Rondas? Rondas { get; set; }

        [BsonElement("participantes_eliminacion")]
        public List<string>? ParticipantesEliminacion { get; set; }

        [BsonElement("es_eliminacion_directa")]
        public bool EsEliminacionDirecta { get; set; } = false;
    }
}