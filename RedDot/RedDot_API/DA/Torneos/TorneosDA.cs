using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using DA.Entidades;
using DA.Repositorio;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DA.Torneos
{
    public class TorneosDA : ITorneosDA
    {
        private readonly IMongoCollection<Torneo> _coleccionTorneos;

        public TorneosDA(IMongoDbContext context)
        {
            _coleccionTorneos = context.GetCollection<Torneo>("torneos");
        }

        public async Task<string> CrearTorneo(SolicitudCrearTorneo torneo, string creadoPor)
        {
            try
            {

                var nuevoTorneo = new Torneo
                {
                    Nombre = torneo.Nombre,
                    Descripcion = torneo.Descripcion,
                    Reglas = torneo.Reglas,
                    Modalidad = torneo.Modalidad,
                    FechaInicio = torneo.FechaInicio,
                    FechaFin = torneo.FechaFin,
                    FechaLimiteInscripcion = torneo.FechaLimiteInscripcion,
                    CuposMaximos = torneo.CuposMaximos,
                    TipoDeporte = torneo.TipoDeporte,
                    Ubicacion = torneo.Ubicacion,
                    DescripcionPremio = torneo.DescripcionPremio,
                    CreadoPor = creadoPor,
                    Estado = EstadoTorneo.Abierto,
                    FechaCreacion = DateTime.UtcNow,
                    Participantes = []
                };

                await _coleccionTorneos.InsertOneAsync(nuevoTorneo);
                return nuevoTorneo.Id ?? string.Empty;
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        public async Task<bool> ActualizarTorneo(SolicitudActualizarTorneo torneo)
        {
            try
            {
                var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, torneo.Id);
                var actualizacion = Builders<Torneo>.Update
                    .Set(t => t.Nombre, torneo.Nombre)
                    .Set(t => t.Descripcion, torneo.Descripcion)
                    .Set(t => t.Reglas, torneo.Reglas)
                    .Set(t => t.Modalidad, torneo.Modalidad)
                    .Set(t => t.FechaInicio, torneo.FechaInicio)
                    .Set(t => t.FechaFin, torneo.FechaFin)
                    .Set(t => t.FechaLimiteInscripcion, torneo.FechaLimiteInscripcion)
                    .Set(t => t.CuposMaximos, torneo.CuposMaximos)
                    .Set(t => t.TipoDeporte, torneo.TipoDeporte)
                    .Set(t => t.Ubicacion, torneo.Ubicacion)
                    .Set(t => t.DescripcionPremio, torneo.DescripcionPremio)
                    .Set(t => t.Estado, torneo.Estado)
                    .Set(t => t.Participantes, torneo.Participantes);

                var resultado = await _coleccionTorneos.UpdateOneAsync(filtro, actualizacion);
                return resultado.ModifiedCount > 0;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> EliminarTorneo(string idTorneo)
        {
            try
            {
                var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);
                var resultado = await _coleccionTorneos.DeleteOneAsync(filtro);
                return resultado.DeletedCount > 0;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo)
        {
            try
            {
                var torneo = await _coleccionTorneos
                    .Find(t => t.Id == idTorneo)
                    .FirstOrDefaultAsync();

                if (torneo == null) return null;

                return MapearARespuesta(torneo);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<RespuestaListaTorneos> ObtenerTorneos(int numeroPagina = 1, int tamanoPagina = 10, EstadoTorneo? estado = null, string? tipoDeporte = null)
        {
            try
            {
                var constructorFiltro = Builders<Torneo>.Filter;
                var filtro = constructorFiltro.Empty;

                if (estado.HasValue)
                {
                    filtro = constructorFiltro.And(filtro, constructorFiltro.Eq(t => t.Estado, estado.Value));
                }

                if (!string.IsNullOrEmpty(tipoDeporte))
                {
                    filtro = constructorFiltro.And(filtro, constructorFiltro.Eq(t => t.TipoDeporte, tipoDeporte));
                }

                var totalRegistros = await _coleccionTorneos.CountDocumentsAsync(filtro);
                var torneos = await _coleccionTorneos
                    .Find(filtro)
                    .Sort(Builders<Torneo>.Sort.Descending(t => t.FechaCreacion))
                    .Skip((numeroPagina - 1) * tamanoPagina)
                    .Limit(tamanoPagina)
                    .ToListAsync();

                return new RespuestaListaTorneos
                {
                    Torneos = torneos.Select(MapearARespuesta).ToList(),
                    TotalRegistros = (int)totalRegistros,
                    NumeroPagina = numeroPagina,
                    TamanoPagina = tamanoPagina,
                    TotalPaginas = (int)Math.Ceiling((double)totalRegistros / tamanoPagina)
                };
            }
            catch (Exception)
            {
                return new RespuestaListaTorneos();
            }
        }

        public async Task<List<RespuestaTorneo>> ObtenerTorneosPorCreador(string creadoPor)
        {
            try
            {
                var torneos = await _coleccionTorneos
                    .Find(t => t.CreadoPor == creadoPor)
                    .Sort(Builders<Torneo>.Sort.Descending(t => t.FechaCreacion))
                    .ToListAsync();

                return torneos.Select(MapearARespuesta).ToList();
            }
            catch (Exception)
            {
                return new List<RespuestaTorneo>();
            }
        }

        public async Task<bool> ActualizarEstadoTorneo(string idTorneo, EstadoTorneo estado)
        {
            try
            {
                var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);
                var actualizacion = Builders<Torneo>.Update.Set(t => t.Estado, estado);
                var resultado = await _coleccionTorneos.UpdateOneAsync(filtro, actualizacion);
                return resultado.ModifiedCount > 0;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> ExisteTorneo(string idTorneo)
        {
            try
            {
                var conteo = await _coleccionTorneos.CountDocumentsAsync(t => t.Id == idTorneo);
                return conteo > 0;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private static RespuestaTorneo MapearARespuesta(Torneo torneo)
        {
            return new RespuestaTorneo
            {
                Id = torneo.Id ?? string.Empty,
                Nombre = torneo.Nombre,
                Descripcion = torneo.Descripcion,
                Reglas = torneo.Reglas,
                Modalidad = torneo.Modalidad,
                FechaInicio = torneo.FechaInicio,
                FechaFin = torneo.FechaFin,
                FechaLimiteInscripcion = torneo.FechaLimiteInscripcion,
                CuposMaximos = torneo.CuposMaximos,
                Participantes = torneo.Participantes,
                Estado = torneo.Estado,
                CreadoPor = torneo.CreadoPor,
                FechaCreacion = torneo.FechaCreacion,
                TipoDeporte = torneo.TipoDeporte,
                Ubicacion = torneo.Ubicacion,
                DescripcionPremio = torneo.DescripcionPremio,
                EstadoTexto = ObtenerTextoEstado(torneo.Estado),
                PuedeInscribirse = torneo.Estado == EstadoTorneo.Abierto &&
                                torneo.Participantes.Count < torneo.CuposMaximos &&
                                DateTime.UtcNow <= torneo.FechaLimiteInscripcion

            };
        }

        private static string ObtenerTextoEstado(EstadoTorneo estado)
        {
            return estado switch
            {
                EstadoTorneo.Abierto => "Abierto para inscripciones",
                EstadoTorneo.EnCurso => "En curso",
                EstadoTorneo.Finalizado => "Finalizado",
                EstadoTorneo.Cancelado => "Cancelado",
                _ => "Desconocido"
            };
        }

        public async Task<bool> AgregarParticipantes(ParticipantesBase participante, string idTorneo)
        {
            try
            {
                var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);
                var torneo = await ObtenerTorneoPorId(idTorneo);

                if (torneo == null) return false;

                var participantes = torneo.Participantes ?? new List<ParticipantesBase>();

                participantes.Add(participante);

                var actualizacion = Builders<Torneo>.Update.Set(t => t.Participantes, participantes);
                var resultado = await _coleccionTorneos.UpdateOneAsync(filtro, actualizacion);

                return resultado.ModifiedCount > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

        public async Task<bool> EliminarMienbroEquipo(string idTorneo, string NombreEquipo, string idUsuario)
        {
            var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);
            var torneo = await ObtenerTorneoPorId(idTorneo);
            if (torneo == null)
                return false;
            var equipo = torneo.Participantes.OfType<Equipo>().FirstOrDefault(e => e.NombreEquipo == NombreEquipo);
            if (equipo == null)
                return false;
            var eliminado = equipo.Integrantes.RemoveAll(i => i.UsuarioId == idUsuario) > 0;
            if (!eliminado)
                return false;
            var index = torneo.Participantes.IndexOf(equipo);
            torneo.Participantes[index] = equipo;
            var torneoDA = ConvertirDA(torneo);
            var resultado = await _coleccionTorneos.ReplaceOneAsync(filtro, torneoDA);
            return resultado.ModifiedCount > 0;
        }



        public async Task<bool> EliminarEquipo(string idTorneo, string NombreEquipo)
        {

            var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);
            var torneo = await ObtenerTorneoPorId(idTorneo);
            if (torneo == null)
                return false;
            var equipo = torneo.Participantes.OfType<Equipo>().FirstOrDefault(e => e.NombreEquipo == NombreEquipo);
            if (equipo == null)
                return false;
            var eliminado = torneo.Participantes.Remove(equipo);
            if (!eliminado)
                return false;
            var torneoDA = ConvertirDA(torneo);
            var resultado = await _coleccionTorneos.ReplaceOneAsync(filtro, torneoDA);
            return resultado.ModifiedCount > 0;
        }
        public async Task<bool> EliminarParticipante(string idTorneo, string IdUsuario)
        {
            var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);
            var torneo = await ObtenerTorneoPorId(idTorneo);
            if (torneo == null)
                return false;
            var participante = torneo.Participantes.OfType<ParticipanteIndividual>().FirstOrDefault(e => e.UsuarioId == IdUsuario);
            if (participante == null)
                return false;
            var eliminado = torneo.Participantes.Remove(participante);
            if (!eliminado)
                return false;
            var torneoDA = ConvertirDA(torneo);
            var resultado = await _coleccionTorneos.ReplaceOneAsync(filtro, torneoDA);
            return resultado.ModifiedCount > 0;
        }
        public async Task<LeaderBoardPorTorneo> LeaderBoardPorTorneo(string idTorneo)
        {
            var torneo = await ObtenerTorneoPorId(idTorneo);
            var leaderBoard = new LeaderBoardPorTorneo();
            if (torneo == null)
                return null;
            leaderBoard.NombreTorneo = torneo.Nombre;
            leaderBoard.Participantes = torneo.Participantes;
            return leaderBoard;
        }
        private Torneo ConvertirDA(RespuestaTorneo torneo)
        {
            return new Torneo
            {
                Id = torneo.Id,
                Nombre = torneo.Nombre,
                Descripcion = torneo.Descripcion,
                Reglas = torneo.Reglas,
                Modalidad = torneo.Modalidad,
                FechaInicio = torneo.FechaInicio,
                FechaFin = torneo.FechaFin,
                FechaLimiteInscripcion = torneo.FechaLimiteInscripcion,
                CuposMaximos = torneo.CuposMaximos,
                TipoDeporte = torneo.TipoDeporte,
                Ubicacion = torneo.Ubicacion,
                DescripcionPremio = torneo.DescripcionPremio,
                Estado = torneo.Estado,
                CreadoPor = torneo.CreadoPor,
                FechaCreacion = torneo.FechaCreacion,
                Participantes = torneo.Participantes
            };
        }


    }
}
