using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Abstracciones.Modelos
{
    public enum CategoriaTorneo
    {
        Contacto,
        Equipo,
        Raqueta,
        Otros
    }

    public enum EstadoTorneo
    {
        PorIniciar,
        EnProgreso,
        Terminado,
        Cancelado
    }

    public class Participante
    {
        [BsonElement("idJugador")]
        public string IdJugador { get; set; }

        [BsonElement("puntaje")]
        public int Puntaje { get; set; }

        [BsonElement("isWinner")]
        public bool IsWinner { get; set; } = false;
    }

    public class Partido
    {
        [BsonElement("participantes")]
        public List<Participante> Participantes { get; set; } = new();

        [BsonElement("completado")]
        public bool Completado { get; set; } = false;
    }

    public class Rondas
    {
        [BsonElement("cuartos")]
        public List<Partido> Cuartos { get; set; } = new();

        [BsonElement("semis")]
        public List<Partido> Semis { get; set; } = new();

        [BsonElement("final")]
        public List<Partido> Final { get; set; } = new();

        [BsonElement("ganador")]
        public string? Ganador { get; set; }
    }

    // MODELO UNIFICADO - Solo este existe ahora
    public class SolicitudCrearTorneo
    {
        [Required(ErrorMessage = "El nombre del torneo es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; }

        [Required(ErrorMessage = "La descripción es requerida")]
        [StringLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string Descripcion { get; set; }

        [Required(ErrorMessage = "La categoría es requerida")]
        public int Categoria { get; set; }

        [Required(ErrorMessage = "El tipo de deporte es requerido")]
        [StringLength(50, ErrorMessage = "El tipo de deporte no puede exceder 50 caracteres")]
        public string TipoDeporte { get; set; }

        // Campos opcionales
        [StringLength(200, ErrorMessage = "La ubicación no puede exceder 200 caracteres")]
        public string? Ubicacion { get; set; }

        [StringLength(300, ErrorMessage = "La descripción del premio no puede exceder 300 caracteres")]
        public string? DescripcionPremio { get; set; }

        [StringLength(500, ErrorMessage = "Las reglas no pueden exceder mas de 500 caracteres")]
        public string reglas { get; set; } = string.Empty;

        [Required(ErrorMessage = "La fecha de inicio es requerida")]
        public DateTime fecha_inicio { get; set; }

        [Required(ErrorMessage = "El numero de cupos es requerido")]
        public int cupos { get; set; }
        [Required(ErrorMessage = "El ID del creador es requerido")]

        public string CreadorId { get; set; } 


    }

    public class SolicitudActualizarPuntaje
    {
        [Required]
        public string IdTorneo { get; set; }

        [Required]
        public string Ronda { get; set; } // "cuartos", "semis", "final"

        [Required]
        public int IndicePartido { get; set; }

        [Required]
        public List<Participante> Participantes { get; set; }
    }

    public class SolicitudAvanzarRonda
    {
        [Required]
        public string IdTorneo { get; set; }

        [Required]
        public string RondaActual { get; set; }
    }

    public class SolicitudAccesoConClave
    {
        [Required]
        public string AccessKey { get; set; }
    }

    // MODELO UNIFICADO - Solo este existe ahora
    public class RespuestaTorneo
    {
        public string Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public CategoriaTorneo Categoria { get; set; }
        public string TipoDeporte { get; set; }
        public string? Ubicacion { get; set; }
        public string? DescripcionPremio { get; set; }
        public string? AccessKey { get; set; } // Solo se muestra al creador
        public EstadoTorneo Estado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime FechaCreacion { get; set; }
        public List<string> Participantes { get; set; } = new();
        public Rondas Rondas { get; set; } = new();
        public bool EsCreador { get; set; }
        public bool TieneAcceso { get; set; }
    }

    public class RespuestaListaTorneos
    {
        public List<RespuestaTorneo> Torneos { get; set; } = new List<RespuestaTorneo>();
        public int TotalRegistros { get; set; }
        public int NumeroPagina { get; set; }
        public int TamanoPagina { get; set; }
        public int TotalPaginas { get; set; }
    }

    public class SolicitudCambiarEstado
    {
        [Required(ErrorMessage = "El ID del torneo es requerido")]
        public string IdTorneo { get; set; }

        [Required(ErrorMessage = "El nuevo estado es requerido")]
        public EstadoTorneo NuevoEstado { get; set; }
    }

    [BsonKnownTypes(typeof(ParticipanteIndividual), typeof(Equipo))]
    public abstract class ParticipantesBase { }

    public class ParticipanteIndividual : ParticipantesBase
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public String UsuarioId { get; set; }
        public String Username { get; set; }
        public Double Calificacion { get; set; }
    }

    public class IntegranteEquipo
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public String UsuarioId { get; set; }
        public String Username { get; set; }
    }

    public class Equipo : ParticipantesBase
    {
        [Required(ErrorMessage = "El nombre del equipo es obligatorio")]
        public string NombreEquipo { get; set; }
        public int Puntuacion { get; set; }

        public List<IntegranteEquipo> Integrantes { get; set; } = new();
    }

    public class AgregarParticipantes
    {
        public List<ParticipantesBase> Participantes { get; set; }
    }

    public class LeaderBoardPorTorneo
    {
        public string NombreTorneo { get; set; }
        public List<ParticipantesBase> Participantes { get; set; } = new();
    }
}