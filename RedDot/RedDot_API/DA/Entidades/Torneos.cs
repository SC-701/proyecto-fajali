using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
        public string Reglas { get; set; }

        [BsonElement("fecha_inicio")]
        public DateTime FechaInicio { get; set; }

        [BsonElement("fecha_fin")]
        public DateTime FechaFin { get; set; }

        [BsonElement("fecha_limite_inscripcion")]
        public DateTime FechaLimiteInscripcion { get; set; }

        [BsonElement("cupos_maximos")]
        public int CuposMaximos { get; set; }

        [BsonElement("participantes_actuales")]
        public int ParticipantesActuales { get; set; } = 0;

        [BsonElement("estado")]
        public EstadoTorneo Estado { get; set; } = EstadoTorneo.Abierto;

        [BsonElement("creado_por")]
        public string CreadoPor { get; set; }

        [BsonElement("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [BsonElement("tipo_deporte")]
        public string TipoDeporte { get; set; }

        [BsonElement("ubicacion")]
        public string Ubicacion { get; set; }

        [BsonElement("descripcion_premio")]
        public string? DescripcionPremio { get; set; }
    }
}