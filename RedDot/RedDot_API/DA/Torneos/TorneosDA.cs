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


        public async Task<string> CrearTorneoEliminacion(SolicitudCrearTorneoEliminacion solicitud, string creadoPor)
        {
            try
            {
                var accessKey = GenerarAccessKey();
                var rondas = InicializarRondas(solicitud.ParticipantesIds);

                var nuevoTorneo = new Torneo
                {
                    Nombre = solicitud.Nombre,
                    Descripcion = solicitud.Descripcion,
                    Categoria = solicitud.Categoria,
                    TipoDeporte = solicitud.TipoDeporte,
                    AccessKey = accessKey,
                    CreadoPor = creadoPor,
                    Estado = EstadoTorneo.PorIniciar,
                    FechaCreacion = DateTime.UtcNow,
                    ParticipantesEliminacion = solicitud.ParticipantesIds,
                    Rondas = rondas,
                    EsEliminacionDirecta = true
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

        public async Task<List<RespuestaTorneoEliminacion>> ObtenerTorneosEliminacionPorUsuario(string nombreUsuario, EstadoTorneo? estado = null)
        {
            try
            {
                var constructorFiltro = Builders<Torneo>.Filter;
                var filtro = constructorFiltro.And(
                    constructorFiltro.Eq(t => t.EsEliminacionDirecta, true),
                    constructorFiltro.Or(
                        constructorFiltro.Eq(t => t.CreadoPor, nombreUsuario),
                        constructorFiltro.AnyEq(t => t.ParticipantesEliminacion, nombreUsuario)
                    )
                );

                if (estado.HasValue)
                {
                    filtro = constructorFiltro.And(filtro, constructorFiltro.Eq(t => t.Estado, estado.Value));
                }

                var torneos = await _coleccionTorneos
                    .Find(filtro)
                    .Sort(Builders<Torneo>.Sort.Descending(t => t.FechaCreacion))
                    .ToListAsync();

                return torneos.Select(t => MapearARespuestaEliminacion(t, nombreUsuario)).ToList();
            }
            catch (Exception)
            {
                return new List<RespuestaTorneoEliminacion>();
            }
        }

        public async Task<RespuestaTorneoEliminacion?> ObtenerTorneoPorAccessKey(string accessKey)
        {
            try
            {
                var torneo = await _coleccionTorneos
                    .Find(t => t.AccessKey == accessKey && t.EsEliminacionDirecta == true)
                    .FirstOrDefaultAsync();

                return torneo != null ? MapearARespuestaEliminacion(torneo, string.Empty) : null;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<RespuestaTorneoEliminacion?> ObtenerTorneoEliminacionPorId(string idTorneo)
        {
            try
            {
                var torneo = await _coleccionTorneos
                    .Find(t => t.Id == idTorneo && t.EsEliminacionDirecta == true)
                    .FirstOrDefaultAsync();

                return torneo != null ? MapearARespuestaEliminacion(torneo, string.Empty) : null;
            }
            catch (Exception)
            {
                return null;
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

                return torneo.CreadoPor == nombreUsuario ||
                       (torneo.ParticipantesEliminacion?.Contains(nombreUsuario) ?? false);
            }
            catch (Exception)
            {
                return false;
            }
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

        private static RespuestaTorneoEliminacion MapearARespuestaEliminacion(Torneo torneo, string nombreUsuario)
        {
            return new RespuestaTorneoEliminacion
            {
                Id = torneo.Id ?? string.Empty,
                Nombre = torneo.Nombre,
                Descripcion = torneo.Descripcion,
                Categoria = torneo.Categoria ?? CategoriaTorneo.Otros,
                TipoDeporte = torneo.TipoDeporte,
                AccessKey = torneo.AccessKey,
                Estado = torneo.Estado,
                CreadoPor = torneo.CreadoPor,
                FechaCreacion = torneo.FechaCreacion,
                Participantes = torneo.ParticipantesEliminacion ?? new List<string>(),
                Rondas = torneo.Rondas ?? new Rondas(),
                EsCreador = torneo.CreadoPor == nombreUsuario,
                TieneAcceso = false 
            };
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
                    Estado = EstadoTorneo.PorIniciar,
                    FechaCreacion = DateTime.UtcNow,
                    Participantes = new List<ParticipantesBase>(),
                    EsEliminacionDirecta = false
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
                var filtro = constructorFiltro.Eq(t => t.EsEliminacionDirecta, false); 

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
                    .Find(t => t.CreadoPor == creadoPor && t.EsEliminacionDirecta == false)
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
                Reglas = torneo.Reglas ?? string.Empty,
                Modalidad = torneo.Modalidad ?? string.Empty,
                FechaInicio = torneo.FechaInicio ?? DateTime.MinValue,
                FechaFin = torneo.FechaFin ?? DateTime.MinValue,
                FechaLimiteInscripcion = torneo.FechaLimiteInscripcion ?? DateTime.MinValue,
                CuposMaximos = torneo.CuposMaximos ?? 0,
                Participantes = torneo.Participantes ?? new List<ParticipantesBase>(),
                Estado = torneo.Estado,
                CreadoPor = torneo.CreadoPor,
                FechaCreacion = torneo.FechaCreacion,
                TipoDeporte = torneo.TipoDeporte,
                Ubicacion = torneo.Ubicacion ?? string.Empty,
                DescripcionPremio = torneo.DescripcionPremio ?? string.Empty,
                EstadoTexto = ObtenerTextoEstado(torneo.Estado),
                PuedeInscribirse = torneo.Estado == EstadoTorneo.PorIniciar &&
                                (torneo.Participantes?.Count ?? 0) < (torneo.CuposMaximos ?? 0) &&
                                DateTime.UtcNow <= (torneo.FechaLimiteInscripcion ?? DateTime.MinValue)
            };
        }

        private static string ObtenerTextoEstado(EstadoTorneo estado)
        {
            return estado switch
            {
                EstadoTorneo.PorIniciar => "Por iniciar",
                EstadoTorneo.EnProgreso => "En progreso",
                EstadoTorneo.Terminado => "Terminado",
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
                Participantes = torneo.Participantes,
                EsEliminacionDirecta = false
            };
        }
    }
}