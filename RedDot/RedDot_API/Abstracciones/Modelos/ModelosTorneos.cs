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

    public class SolicitudCrearTorneoEliminacion
    {
        [Required(ErrorMessage = "El nombre del torneo es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; }

        [Required(ErrorMessage = "La descripción es requerida")]
        [StringLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string Descripcion { get; set; }

        [Required(ErrorMessage = "La categoría es requerida")]
        public CategoriaTorneo Categoria { get; set; }

        [Required(ErrorMessage = "El tipo de deporte es requerido")]
        [StringLength(50, ErrorMessage = "El tipo de deporte no puede exceder 50 caracteres")]
        public string TipoDeporte { get; set; }

        public List<string> ParticipantesIds { get; set; } = new();
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

    public class RespuestaTorneoEliminacion
    {
        public string Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public CategoriaTorneo Categoria { get; set; }
        public string TipoDeporte { get; set; }
        public string? AccessKey { get; set; } // Solo se muestra al creador
        public EstadoTorneo Estado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime FechaCreacion { get; set; }
        public List<string> Participantes { get; set; } = new();
        public Rondas Rondas { get; set; } = new();
        public bool EsCreador { get; set; }
        public bool TieneAcceso { get; set; }
    }

    public class SolicitudCrearTorneo
    {
        [Required(ErrorMessage = "El nombre del torneo es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; }

        [Required(ErrorMessage = "La descripción es requerida")]
        [StringLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string Descripcion { get; set; }

        [Required(ErrorMessage = "Las reglas son requeridas")]
        public string Reglas { get; set; }

        [Required(ErrorMessage = "La modalidad es requerida")]
        public string Modalidad { get; set; }

        [Required(ErrorMessage = "La fecha de inicio es requerida")]
        public DateTime FechaInicio { get; set; }

        [Required(ErrorMessage = "La fecha de fin es requerida")]
        public DateTime FechaFin { get; set; }

        [Required(ErrorMessage = "La fecha límite de inscripción es requerida")]
        public DateTime FechaLimiteInscripcion { get; set; }

        [Required(ErrorMessage = "El número máximo de participantes es requerido")]
        [Range(2, 1000, ErrorMessage = "El número de participantes debe estar entre 2 y 1000")]
        public int CuposMaximos { get; set; }

        [Required(ErrorMessage = "El tipo de deporte es requerido")]
        [StringLength(50, ErrorMessage = "El tipo de deporte no puede exceder 50 caracteres")]
        public string TipoDeporte { get; set; }

        [Required(ErrorMessage = "La ubicación es requerida")]
        [StringLength(200, ErrorMessage = "La ubicación no puede exceder 200 caracteres")]
        public string Ubicacion { get; set; }

        [StringLength(300, ErrorMessage = "La descripción del premio no puede exceder 300 caracteres")]
        public string? DescripcionPremio { get; set; }

        public List<ParticipantesBase> Participantes { get; set; } = new();
    }

    public class SolicitudActualizarTorneo
    {
        [Required(ErrorMessage = "El ID del torneo es requerido")]
        public string Id { get; set; }

        [Required(ErrorMessage = "El nombre del torneo es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; }

        [Required(ErrorMessage = "La descripción es requerida")]
        [StringLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string Descripcion { get; set; }

        [Required(ErrorMessage = "Las reglas son requeridas")]
        public string Reglas { get; set; }

        [Required(ErrorMessage = "La modalidad es requerida")]
        public string Modalidad { get; set; }

        [Required(ErrorMessage = "La fecha de inicio es requerida")]
        public DateTime FechaInicio { get; set; }

        [Required(ErrorMessage = "La fecha de fin es requerida")]
        public DateTime FechaFin { get; set; }

        [Required(ErrorMessage = "La fecha límite de inscripción es requerida")]
        public DateTime FechaLimiteInscripcion { get; set; }

        [Required(ErrorMessage = "El número máximo de participantes es requerido")]
        [Range(2, 1000, ErrorMessage = "El número de participantes debe estar entre 2 y 1000")]
        public int CuposMaximos { get; set; }

        [Required(ErrorMessage = "El tipo de deporte es requerido")]
        [StringLength(50, ErrorMessage = "El tipo de deporte no puede exceder 50 caracteres")]
        public string TipoDeporte { get; set; }

        [Required(ErrorMessage = "La ubicación es requerida")]
        [StringLength(200, ErrorMessage = "La ubicación no puede exceder 200 caracteres")]
        public string Ubicacion { get; set; }

        [StringLength(300, ErrorMessage = "La descripción del premio no puede exceder 300 caracteres")]
        public string? DescripcionPremio { get; set; }

        [Required(ErrorMessage = "El estado del torneo es requerido")]
        public EstadoTorneo Estado { get; set; }
        public List<ParticipantesBase> Participantes { get; set; }
    }

    public class RespuestaTorneo
    {
        public string Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string Reglas { get; set; }
        public string Modalidad { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public DateTime FechaLimiteInscripcion { get; set; }
        public int CuposMaximos { get; set; }
        public EstadoTorneo Estado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string TipoDeporte { get; set; }
        public string Ubicacion { get; set; }
        public string? DescripcionPremio { get; set; }
        public string EstadoTexto { get; set; }
        public bool PuedeInscribirse { get; set; }
        public List<ParticipantesBase> Participantes { get; set; }
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
