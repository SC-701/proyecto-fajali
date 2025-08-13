using System.Linq;
using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using DA.Entidades;
using DA.Repositorio;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace DA.Torneos
{
    public class TorneosDA : ITorneosDA
    {
        private readonly IMongoCollection<Torneo> _coleccionTorneos;
        private readonly IMongoCollection<User> _users;

        public TorneosDA(IMongoDbContext context)
        {
            _coleccionTorneos = context.GetCollection<Torneo>("torneos");
            _users = context.GetCollection<User>("users");
        }


        public async Task<RespuestaTorneo?> CrearTorneo(SolicitudCrearTorneo solicitud)
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
                    Rondas = InicializarRondas(),
                    Participantes = []
                };

                await _coleccionTorneos.InsertOneAsync(nuevoTorneo);
                return MapearARespuesta(nuevoTorneo,nuevoTorneo.CreadoPor);
            }
            catch (Exception)
            {
                return null;
            }
        }
        public async Task<bool> ActualizarPuntajePartido(string idTorneo, string ronda, int indicePartido, List<Participante> participantes, Partido match)
        {
            try
            {
                var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);
                var torneo = await _coleccionTorneos.Find(filtro).FirstOrDefaultAsync();



                var partidos = ronda switch
                {
                    "cuartos" => torneo.Rondas.Cuartos,
                    "semis" => torneo.Rondas.Semis,
                    "final" => torneo.Rondas.Final,
                    _ => null
                };




                partidos[indicePartido] = match;
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
        public async Task<List<RespuestaTorneo>> ObtenerTorneosPorUsuario(string nombreUsuario, int estado = 0)
        {
            try
            {

                var constructorFiltro = Builders<Torneo>.Filter;
                var filtro = constructorFiltro.Or(
                    constructorFiltro.Eq(t => t.CreadoPor, creador)
                );

                if (estado > 0)
                {
                    filtro = constructorFiltro.And(filtro, constructorFiltro.Eq(t => t.Estado, estado));
                }

                var torneos = await _coleccionTorneos
                    .Find(filtro)
                    .Sort(Builders<Torneo>.Sort.Descending(t => t.FechaCreacion))
                    .ToListAsync();

                return torneos.Select(t => MapearARespuesta(t, creador)).ToList();
            }
            catch (Exception)
            {
                return new List<RespuestaTorneo>();
            }
        }
        public async Task<RespuestaTorneo?> ObtenerTorneoPorAccessKey(string accessKey, string id)
        {
            try
            {
                var torneo = await _coleccionTorneos
                    .Find(t => t.AccessKey == accessKey)
                    .FirstOrDefaultAsync();

                if (torneo != null)
                {
                    var usuario = await _users.Find(x => x.Id == id).FirstOrDefaultAsync();


                    usuario.Torneos.Add(torneo.Id);
                    usuario.TournamentsJoined++;
                    var filtro = Builders<User>.Filter.Eq(x => x.Id, usuario.Id);
                    var Agregar = Builders<User>.Update.Set(x => x.Torneos, usuario.Torneos)
                                                       .Set(x => x.TournamentsJoined, usuario.TournamentsJoined);
                    var resultado = await _users.UpdateOneAsync(filtro, Agregar);
                    if (resultado.ModifiedCount > 0)
                    {

                        torneo.Participantes.Add(new ParticipanteTorneo
                        {

                            id = usuario.Id,
                            name = usuario.UserName,
                            isSet = false,

                        });

                        var filtroTorneo = Builders<Torneo>.Filter.Eq(x => x.Id, torneo.Id);
                        var agregarTorneo = Builders<Torneo>.Update.Set(x => x.Participantes, torneo.Participantes);
                        var resultadoTorneo = await _coleccionTorneos.UpdateOneAsync(filtroTorneo, agregarTorneo);

                        if (resultadoTorneo.ModifiedCount > 0)
                        {
                            return MapearARespuesta(torneo, string.Empty);
                        }

                        return null;

                    }
                    return null;

                }
                return null;


            }
            catch (Exception)
            {
                return null;
            }
        }
        public async Task<RespuestaListaTorneos> ObtenerTorneos(string id, int numeroPagina = 1, int tamanoPagina = 10, int estado = 0, string? tipoDeporte = null)
        {
            try
            {

                var constructorFiltro = Builders<Torneo>.Filter;
                var filtro = constructorFiltro.Empty;

                if (estado > 0)
                {
                    filtro = constructorFiltro.And(filtro, constructorFiltro.Eq(t => t.Estado, estado));
                }

                if (!string.IsNullOrEmpty(tipoDeporte))
                {
                    filtro = constructorFiltro.And(filtro, constructorFiltro.Eq(t => t.TipoDeporte, tipoDeporte));
                }

                filtro = constructorFiltro.And(filtro, constructorFiltro.Ne(t => t.CreadoPor, id));

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

                var estadoActualizado = estado + 1;
                var filtro = Builders<Torneo>.Filter.Eq(t => t.Id, idTorneo);
                var actualizacion = Builders<Torneo>.Update.Set(t => t.Estado, estadoActualizado);
                var resultado = await _coleccionTorneos.UpdateOneAsync(filtro, actualizacion);

                if (estado == 0)
                {
                    return resultado.ModifiedCount > 0;
                }

                var torneo = await _coleccionTorneos.Find(x => x.Id == idTorneo).FirstOrDefaultAsync();

                if (estado == 1)
                {


                    var participantesSemis = torneo.Rondas.Cuartos.Select(

                        y => y.Participantes.Where(z => z.IsWinner).Select(z => z.IdJugador)

                        ).ToList();

                    torneo.Participantes.ForEach(
                        x =>
                        {
                            if (participantesSemis.Any(y => y.Contains(x.id)))
                            {
                                x.isSet = false;
                            }

                        });
                    var actualizaPartipantes = Builders<Torneo>.Update.Set(x => x.Participantes, torneo.Participantes);

                    var resultadoPartipantes = await _coleccionTorneos.UpdateOneAsync(filtro, actualizaPartipantes);


                    return resultado.ModifiedCount > 0;



                }
                if (estado == 2)
                {

                    var participantesFinal = torneo.Rondas.Semis.Select(

                        y => y.Participantes.Where(z => z.IsWinner).Select(z => z.IdJugador)

                        ).ToList();

                    torneo.Participantes.ForEach(
                        x =>
                        {
                            if (participantesFinal.Any(y => y.Contains(x.id)))
                            {
                                x.isSet = false;
                            }

                        });
                    var actualizaPartipantes = Builders<Torneo>.Update.Set(x => x.Participantes, torneo.Participantes);

                    var resultadoPartipantes = await _coleccionTorneos.UpdateOneAsync(filtro, actualizaPartipantes);


                    return resultado.ModifiedCount > 0;
                }
                if (estado == 3)
                {
                    var ganadorId = torneo.Rondas.Final
                     .SelectMany(y => y.Participantes)
                     .Where(z => z.IsWinner)
                     .Select(z => z.IdJugador)
                     .FirstOrDefault();
                    var jugador = await _users.Find(x => x.Id == ganadorId).FirstOrDefaultAsync();

                    torneo.Rondas.Ganador = jugador.UserName;

                    var actualizaPartipantes = Builders<Torneo>.Update.Set(x => x.Rondas.Ganador, torneo.Rondas.Ganador);

                    var resultadoPartipantes = await _coleccionTorneos.UpdateOneAsync(filtro, actualizaPartipantes);



                    jugador.TournamentsWon++;

                    var actualizarJugador = Builders<User>.Update.Set(x => x.TournamentsWon, jugador.TournamentsWon);
                    var filtroJugador = Builders<User>.Filter.Eq(x => x.Id, jugador.Id);

                    var actualizarGanador = await _users.UpdateOneAsync(filtroJugador, actualizarJugador);

                    return actualizarGanador.ModifiedCount > 0;


                }

                return false;



            }
            catch (Exception)
            {
                return false;
            }
        }
        public async Task<List<RespuestaTorneo>> ObtenerTorneosParticipando(string idUsuario, int estado = 0)
        {
            try
            {
                var usuario = await _users.Find(u => u.Id == idUsuario).FirstOrDefaultAsync();
                if (usuario?.Torneos == null || usuario.Torneos.Count == 0)
                {
                    return new List<RespuestaTorneo>();
                }

                var constructorFiltro = Builders<Torneo>.Filter;
                var filtro = constructorFiltro.And(
                    constructorFiltro.In(t => t.Id, usuario.Torneos),
                    constructorFiltro.Ne(t => t.CreadoPor, idUsuario)
                );

                if (estado > 0)
                {
                    filtro = constructorFiltro.And(filtro, constructorFiltro.Eq(t => t.Estado, estado));
                }

                var torneos = await _coleccionTorneos
                    .Find(filtro)
                    .Sort(Builders<Torneo>.Sort.Descending(t => t.FechaCreacion))
                    .ToListAsync();

                return torneos.Select(t => MapearARespuesta(t, string.Empty)).ToList();
            }
            catch (Exception)
            {
                return new List<RespuestaTorneo>();
            }
        }
        public async Task<bool> ActualizarMatch(MatchChangeRequest matchStatus)
        {
            try
            {
                if (matchStatus == null || string.IsNullOrEmpty(matchStatus.tournamentId) ||
                    string.IsNullOrEmpty(matchStatus.matchIndex) || matchStatus.match == null)
                {
                    return false;
                }

                if (!int.TryParse(matchStatus.matchIndex, out var index))
                {
                    return false;
                }

                var filtroTorneo = Builders<Torneo>.Filter.Eq(x => x.Id, matchStatus.tournamentId);
                var resultadoTorneo = await _coleccionTorneos.Find(filtroTorneo).FirstOrDefaultAsync();

                if (resultadoTorneo == null || resultadoTorneo.Rondas == null)
                {
                    return false;
                }

                var participantes = matchStatus.participantes ?? new List<ParticipanteTorneo>();

                participantes.ForEach(p =>
                {
                    var participanteEnMatch = matchStatus.match.Participantes?.Any(mp => mp.IdJugador == p.id) ?? false;
                    if (participanteEnMatch)
                    {
                        p.isSet = true;
                    }
                });

                var updateJugadores = Builders<Torneo>.Update.Set(x => x.Participantes, participantes);
                var resultadoUpdateJugadores = await _coleccionTorneos.UpdateOneAsync(filtroTorneo, updateJugadores);

                if (resultadoUpdateJugadores.ModifiedCount == 0)
                {
                    return false;
                }

                var roundNameLower = matchStatus.roundName?.ToLower() ?? string.Empty;

                switch (roundNameLower)
                {
                    case "cuartos de final":
                    case "cuartos":
                        if (index >= 0 && index < resultadoTorneo.Rondas.Cuartos.Count)
                        {
                            var updateCuartos = Builders<Torneo>.Update.Set(x => x.Rondas.Cuartos[index], matchStatus.match);
                            var resultadoCuartos = await _coleccionTorneos.UpdateOneAsync(filtroTorneo, updateCuartos);
                            return resultadoCuartos.ModifiedCount > 0;
                        }
                        break;

                    case "semis":
                    case "semifinales":
                        if (index >= 0 && index < resultadoTorneo.Rondas.Semis.Count)
                        {
                            var updateSemis = Builders<Torneo>.Update.Set(x => x.Rondas.Semis[index], matchStatus.match);
                            var resultadoSemis = await _coleccionTorneos.UpdateOneAsync(filtroTorneo, updateSemis);
                            return resultadoSemis.ModifiedCount > 0;
                        }
                        break;

                    case "final":
                        if (index == 0 && resultadoTorneo.Rondas.Final.Count > 0)
                        {
                            var updateFinal = Builders<Torneo>.Update.Set(x => x.Rondas.Final[index], matchStatus.match);
                            var resultadoFinal = await _coleccionTorneos.UpdateOneAsync(filtroTorneo, updateFinal);
                            return resultadoFinal.ModifiedCount > 0;
                        }
                        break;

                    default:
                        return false;
                }

                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }


        public async Task<RespuestaListaTorneos> TorneosActivos()
        {
            var filtro = Builders<Torneo>.Filter.Eq(x => x.Estado, 0);
            var torneos = await _coleccionTorneos
                    .Find(filtro)
                    .Sort(Builders<Torneo>.Sort.Descending(t => t.FechaCreacion))
                    .ToListAsync();
            return new RespuestaListaTorneos { Torneos = torneos.Select(t => MapearARespuesta(t, string.Empty)).ToList() };

        }
        public async Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo)
        {
            try
            {
                var torneo = await _coleccionTorneos
                    .Find(t => t.Id == idTorneo)
                    .FirstOrDefaultAsync();

                return torneo != null ? MapearARespuesta(torneo, torneo.CreadoPor) : null;
            }
            catch (Exception)
            {
                return null;
            }
        }
        private static string GenerarAccessKey()
        {
            return Guid.NewGuid().ToString("N")[..8].ToUpper();
        }
        private static Rondas InicializarRondas()
        {
            var rondas = new Rondas();

            for (int i = 0; i < 4; i++)
            {
                var partido = new Partido
                {
                    Participantes = new List<Participante>
                    {
                        new Participante(),
                        new Participante()
                    }
                };
                rondas.Cuartos.Add(partido);
            }

            for (int i = 0; i < 2; i++)
            {
                var partido = new Partido
                {
                    Participantes = new List<Participante>
                    {
                        new Participante(),
                        new Participante()
                    }
                };
                rondas.Semis.Add(partido);
            }
            rondas.Final.Add(new Partido
            {
                Participantes = new List<Participante>
                {
                    new Participante(),
                    new Participante()
                }
            });

            return rondas;
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
                Reglas = torneo.Reglas,
                AccessKey = torneo.AccessKey,
                Estado = torneo.Estado,
                CreadoPor = torneo.CreadoPor,
                FechaCreacion = torneo.FechaCreacion,
                Rondas = torneo.Rondas ?? new Rondas(),
                EsCreador = torneo.CreadoPor == nombreUsuario,
                TieneAcceso = false,
                Participantes = torneo.Participantes
            };
        }

    }
}
