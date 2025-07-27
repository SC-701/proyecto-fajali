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
    // ✅ EstadoTorneo debe ser un ENUM
    public enum EstadoTorneo
    {
        Abierto,
        EnCurso,
        Finalizado,
        Cancelado
    }

    // ✅ SolicitudCrearTorneo (que está faltando)
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
        public String UsuarioId { get; set; }
        public String Username { get; set; }
        public Double Calificacion { get; set; }
    }

    public class IntegranteEquipo
    {
        public String UsuarioId { get; set; }
        public String Username { get; set; }
    }
    public class Equipo : ParticipantesBase
    {
        [Required(ErrorMessage ="El nombre del equipo es obligatorio")]
        public string NombreEquipo { get; set; }
        public int Puntuacion { get; set; }

        public List<IntegranteEquipo> Integrantes { get; set; } = new();
    }
    public class AgregarParticipantes
    {
        public List<ParticipantesBase> Participantes { get; set; }

    }
}