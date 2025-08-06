using System.Linq;
using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using DA.Entidades;
using DA.Repositorio;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
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

        // MÉTODO UNIFICADO - Crear Torneo (siempre de eliminación con 8 participantes)
        public async Task<string> CrearTorneo(SolicitudCrearTorneo solicitud)
        {
            try
            {
                var accessKey = GenerarAccessKey();


                var nuevoTorneo = new Torneo
                {
                    Nombre = solicitud.Nombre,
                    Descripcion = solicitud.Descripcion,
                    Categoria = solicitud.Categoria,
                    TipoDeporte = solicitud.TipoDeporte,
                    Ubicacion = solicitud.Ubicacion,
                    Premio = solicitud.DescripcionPremio,
                    DescripcionPremio = solicitud.DescripcionPremio,
                    AccessKey = accessKey,
                    CreadoPor = solicitud.CreadorId,
                    Estado = 0,
                    FechaCreacion = DateTime.UtcNow,
                    CuposMaximos = solicitud.cupos,
                    FechaInicio = solicitud.fecha_inicio,
                    Reglas = solicitud.reglas,
                    Rondas = new Rondas(),
                    Participantes = new List<ParticipantesBase>(),
                };

                await _coleccionTorneos.InsertOneAsync(nuevoTorneo);
                return nuevoTorneo.Id ?? string.Empty;
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        public async Task<bool> ActualizarPuntajePartido(string idTorneo, string ronda, int indicePartido, List<Participante> participantes)
        {
            try
            {
                var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);
                var torneo = await _coleccionTorneos.Find(filtro).FirstOrDefaultAsync();

                if (torneo?.Rondas == null) return false;

                var partidos = ronda switch
                {
                    "cuartos" => torneo.Rondas.Cuartos,
                    "semis" => torneo.Rondas.Semis,
                    "final" => torneo.Rondas.Final,
                    _ => null
                };

                if (partidos == null || indicePartido >= partidos.Count) return false;

                var ganador = participantes.OrderByDescending(p => p.Puntaje).First();
                foreach (var p in participantes)
                {
                    p.IsWinner = p.IdJugador == ganador.IdJugador;
                }

                partidos[indicePartido].Participantes = participantes;
                partidos[indicePartido].Completado = true;

                var actualizacion = Builders<Torneo>.Update.Set(t => t.Rondas, torneo.Rondas);
                var resultado = await _coleccionTorneos.UpdateOneAsync(filtro, actualizacion);

                return resultado.ModifiedCount > 0;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> AvanzarRondaTorneo(string idTorneo, string rondaActual)
        {
            try
            {
                var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);
                var torneo = await _coleccionTorneos.Find(filtro).FirstOrDefaultAsync();

                if (torneo?.Rondas == null) return false;

                switch (rondaActual)
                {
                    case "cuartos":
                        var ganadoresCuartos = ObtenerGanadoresRonda(torneo.Rondas.Cuartos);
                        torneo.Rondas.Semis = CrearPartidosSiguienteRonda(ganadoresCuartos);
                        break;

                    case "semis":
                        var ganadoresSemis = ObtenerGanadoresRonda(torneo.Rondas.Semis);
                        torneo.Rondas.Final = CrearPartidosSiguienteRonda(ganadoresSemis);
                        break;

                    case "final":
                        var ganadorFinal = ObtenerGanadoresRonda(torneo.Rondas.Final).FirstOrDefault();
                        if (ganadorFinal != null)
                        {
                            torneo.Rondas.Ganador = ganadorFinal;
                        }
                        break;
                }

                var actualizacion = Builders<Torneo>.Update.Set(t => t.Rondas, torneo.Rondas);
                var resultado = await _coleccionTorneos.UpdateOneAsync(filtro, actualizacion);

                return resultado.ModifiedCount > 0;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<List<RespuestaTorneo>> ObtenerTorneosPorUsuario(string nombreUsuario, int estado = 0)
        {
            try
            {
                var constructorFiltro = Builders<Torneo>.Filter;
                var filtro = constructorFiltro.Or(
                    constructorFiltro.Eq(t => t.CreadoPor, nombreUsuario)
                );

                if (estado>0)
                {
                    filtro = constructorFiltro.And(filtro, constructorFiltro.Eq(t => t.Estado, estado));
                }

                var torneos = await _coleccionTorneos
                    .Find(filtro)
                    .Sort(Builders<Torneo>.Sort.Descending(t => t.FechaCreacion))
                    .ToListAsync();

                return torneos.Select(t => MapearARespuesta(t, nombreUsuario)).ToList();
            }
            catch (Exception)
            {
                return new List<RespuestaTorneo>();
            }
        }

        public async Task<RespuestaTorneo?> ObtenerTorneoPorAccessKey(string accessKey)
        {
            try
            {
                var torneo = await _coleccionTorneos
                    .Find(t => t.AccessKey == accessKey)
                    .FirstOrDefaultAsync();

                return torneo != null ? MapearARespuesta(torneo, string.Empty) : null;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo)
        {
            try
            {
                var torneo = await _coleccionTorneos
                    .Find(t => t.Id == idTorneo)
                    .FirstOrDefaultAsync();

                return torneo != null ? MapearARespuesta(torneo, string.Empty) : null;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<RespuestaListaTorneos> ObtenerTorneos(string id,int numeroPagina = 1, int tamanoPagina = 10, int estado = 0, string? tipoDeporte = null)
        {
            try
            {
                
                var constructorFiltro = Builders<Torneo>.Filter;
                var filtro = constructorFiltro.Empty;

                if (estado>0)
                {
                    filtro = constructorFiltro.And(filtro, constructorFiltro.Eq(t => t.Estado, estado));
                }

                if (!string.IsNullOrEmpty(tipoDeporte))
                {
                    filtro = constructorFiltro.And(filtro, constructorFiltro.Eq(t => t.TipoDeporte, tipoDeporte));
                }

                filtro = constructorFiltro.And(filtro, constructorFiltro.Ne(t => t.CreadoPor , id));

                var totalRegistros = await _coleccionTorneos.CountDocumentsAsync(filtro);
                var torneos = await _coleccionTorneos
                    .Find(filtro)
                    .Sort(Builders<Torneo>.Sort.Descending(t => t.FechaCreacion))
                    .Skip((numeroPagina - 1) * tamanoPagina)
                    .Limit(tamanoPagina)
                    .ToListAsync();

                return new RespuestaListaTorneos
                {
                    Torneos = torneos.Select(t => MapearARespuesta(t, string.Empty)).ToList(),
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

        public async Task<bool> ActualizarEstadoTorneo(string idTorneo, int estado)
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

        public async Task<bool> UsuarioTieneAccesoTorneo(string idTorneo, string nombreUsuario)
        {
            try
            {
                var torneo = await _coleccionTorneos
                    .Find(t => t.Id == idTorneo)
                    .FirstOrDefaultAsync();

                if (torneo == null) return false;

                return torneo.CreadoPor == nombreUsuario;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public async Task<LeaderBoardPorTorneo> LeaderBoardPorTorneo(string idTorneo)
        {
            var torneo = await ObtenerTorneoPorId(idTorneo);
            if (torneo == null) return null;

            return new LeaderBoardPorTorneo
            {
                NombreTorneo = torneo.Nombre,
                Participantes = new List<ParticipantesBase>()
            };
        }

        public async Task<bool> AgregarParticipantesTorneo(string idTorneo, List<string> participantesIds)
        {
           throw new NotImplementedException("Este método no está implementado en la versión actual.");
        }
        private static string GenerarAccessKey()
        {
            return Guid.NewGuid().ToString("N")[..8].ToUpper();
        }

        private static Rondas InicializarRondas(List<string> participantes)
        {
            var rondas = new Rondas();

            for (int i = 0; i < 4; i++)
            {
                var partido = new Partido
                {
                    Participantes = new List<Participante>
                    {
                        new() { IdJugador = participantes[i * 2], Puntaje = 0 },
                        new() { IdJugador = participantes[i * 2 + 1], Puntaje = 0 }
                    }
                };
                rondas.Cuartos.Add(partido);
            }

            return rondas;
        }

        private static List<string> ObtenerGanadoresRonda(List<Partido> partidos)
        {
            return partidos
                .Where(p => p.Completado)
                .Select(p => p.Participantes.First(part => part.IsWinner).IdJugador)
                .ToList();
        }

        private static List<Partido> CrearPartidosSiguienteRonda(List<string> ganadores)
        {
            var partidos = new List<Partido>();

            for (int i = 0; i < ganadores.Count; i += 2)
            {
                if (i + 1 < ganadores.Count)
                {
                    var partido = new Partido
                    {
                        Participantes = new List<Participante>
                        {
                            new() { IdJugador = ganadores[i], Puntaje = 0 },
                            new() { IdJugador = ganadores[i + 1], Puntaje = 0 }
                        }
                    };
                    partidos.Add(partido);
                }
            }

            return partidos;
        }

        private static RespuestaTorneo MapearARespuesta(Torneo torneo, string nombreUsuario)
        {
            return new RespuestaTorneo
            {
                Id = torneo.Id ?? string.Empty,
                Nombre = torneo.Nombre,
                Descripcion = torneo.Descripcion,
                TipoDeporte = torneo.TipoDeporte,
                Ubicacion = torneo.Ubicacion,
                DescripcionPremio = torneo.DescripcionPremio,
                AccessKey = torneo.AccessKey,
                Equipos = torneo.Equipos,
                Estado = torneo.Estado,
                CreadoPor = torneo.CreadoPor,
                FechaCreacion = torneo.FechaCreacion,
                Rondas = torneo.Rondas ?? new Rondas(),
                EsCreador = torneo.CreadoPor == nombreUsuario,
                TieneAcceso = false
            };
        }

        public async Task<bool> AgregarParticipantesIndividuales(string idTorneo, List<string> participantesIds)
        {
            try
            {
                var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);

                var actualizacion = Builders<Torneo>.Update.PushEach(t => t.Participantes, participantesIds);

                var resultado = await _coleccionTorneos.UpdateOneAsync(filtro, actualizacion);
                return resultado.ModifiedCount > 0;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> AgregarParticipantesEquipos(string idTorneo, List<Equipo> Equipos)
        {
            try
            {
                var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);
                var actualizacionEquipos = Builders<Torneo>.Update.PushEach(t => t.Equipos, Equipos);
                var resultadoEquipos = await _coleccionTorneos.UpdateOneAsync(filtro, actualizacionEquipos);
                if (resultadoEquipos.ModifiedCount < 0)
                    return false;
                var torneo = await ObtenerTorneoPorId(idTorneo);
                var equipos = new List<string>();
                foreach (var equipo in torneo.Equipos)
                {
                    equipos.Add(equipo.IdEquipo);
                }
                var actualizacionParticipantes = Builders<Torneo>.Update.PushEach(t => t.Participantes, equipos);
                var resultadoParticipantes = await _coleccionTorneos.UpdateOneAsync(filtro, actualizacionParticipantes);

                if (resultadoParticipantes.ModifiedCount < 0)
                    return false;
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}