using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using DA.Entidades;
using DA.Repositorio;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DA.Usuarios
{
    public class UsuariosDA : IUsuariosDA
    {

        private readonly IMongoCollection<User> _conexion;
        private readonly IMongoCollection<Torneo> _torneos;
        private readonly IConfiguration _configuracion;


        public UsuariosDA(IMongoDbContext context, IConfiguration configuration)
        {
            this._configuracion = configuration;


            this._conexion = context.GetCollection<User>("users");
            this._torneos = context.GetCollection<Torneo>("torneos");
        }
        public async Task<TokenDTO> Login(UserBase usuario)
        {

            var usuarioDB = await _conexion.Find(x => x.UserName == usuario.UserName).FirstOrDefaultAsync();

            if (usuarioDB == null)
            {
                return new TokenDTO { ValidationSuccess = false, AccessToken = string.Empty };
            }
            var passwordHash = HashSHA256(usuario.Password);
            if (usuarioDB.Password != passwordHash)
            {
                return new TokenDTO { ValidationSuccess = false, AccessToken = string.Empty }; ;
            }

            TokenDTO respuestaToken = new TokenDTO() { AccessToken = string.Empty, ValidationSuccess = false };
            TokenConfiguration tokenConfiguration = _configuracion.GetSection("Token").Get<TokenConfiguration>();
            JwtSecurityToken token = await JWTTokenGenerator(usuarioDB, tokenConfiguration);

            respuestaToken.AccessToken = new JwtSecurityTokenHandler().WriteToken(token);
            respuestaToken.ValidationSuccess = true;
            respuestaToken.user = usuarioDB.Id;

            return respuestaToken;

        }

        public async Task<bool> Register(UserRegister usuario)
        {
            try
            {
                var existingUser = await _conexion.Find(x => x.UserName == usuario.UserName || x.Email == usuario.Email).FirstOrDefaultAsync();

                if (existingUser != null)
                {
                    return false;
                }
                usuario.Password = HashSHA256(usuario.Password);

                await _conexion.InsertOneAsync(new User
                {
                    UserName = usuario.UserName,
                    Email = usuario.Email,
                    Password = usuario.Password,
                    Torneos = usuario.Torneos

                });

                return true;
            }
            catch (Exception ex)
            {

                Console.WriteLine($"Error al registrar usuario: {ex.Message}");
                return false;
            }
        }

        private static string HashSHA256(string texto)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(texto);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToHexString(hash); // .NET 5+; para versiones anteriores usa BitConverter.ToString(hash).Replace("-", "")
        }

        private async Task<JwtSecurityToken> JWTTokenGenerator(User user, TokenConfiguration tokenConfiguration)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenConfiguration.Key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            List<Claim> claims = await ClaimsGeneration(user);

            var token = new JwtSecurityToken(
                issuer: tokenConfiguration.Issuer,
                audience: tokenConfiguration.Audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(tokenConfiguration.Expires),
                signingCredentials: credentials
            );

            return token;
        }

        private Task<List<Claim>> ClaimsGeneration(User user)
        {
            var claims = new List<Claim>
        {

            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Email, user.Email),

        };


            return Task.FromResult(claims);

        }

        public async Task<bool> InscribirUsuarioTorneo(RespuestaTorneo torneoBD, string IdUsuario)
        {
            var filtro = Builders<User>.Filter.Eq(u => u.Id, IdUsuario);
            var usuarioDB = await _conexion.Find(x => x.Id == IdUsuario).FirstOrDefaultAsync();
            if (usuarioDB == null)
                return false;
            var torneos = usuarioDB.Torneos ?? new List<string>();
            if (torneos == null)
                return false;
            if (torneos.Contains(torneoBD.Id))
                return false; // El usuario ya está inscrito en el torneo
            torneos.Add(torneoBD.Id);
            var actualizacion = Builders<User>.Update.Set(t => t.Torneos, torneos);
            var resultado = await _conexion.UpdateOneAsync(filtro, actualizacion);
            return resultado.ModifiedCount > 0;
        }

        public async Task<bool> EliminarUsuarioEnTorneo(RespuestaTorneo torneoBD, string idUsuario)
        {
            var filtro = Builders<User>.Filter.Eq(u => u.Id, idUsuario);
            var usuarioDB = await _conexion.Find(x => x.Id == idUsuario).FirstOrDefaultAsync();
            if (usuarioDB == null)
                return false;
            var torneos = usuarioDB.Torneos ?? new List<string>();
            if (torneos == null)
                 return false;
            if (!torneos.Contains(torneoBD.Id))
                return false; // El usuario no está inscrito en el torneo
            var eliminacion = torneos.Remove(torneoBD.Id);
            if (!eliminacion)
                return false;
            var actualizacion = Builders<User>.Update.Set(t => t.Torneos, torneos);
            var resultado = await _conexion.UpdateOneAsync(filtro, actualizacion);
            return resultado.ModifiedCount > 0;
        }

        public async Task<bool> EditarUsuario(UserUI usuario)
        {
            var user = await _conexion.UpdateOneAsync(
                Builders<User>.Filter.Eq(u => u.Id, usuario.Id),
                Builders<User>.Update
                    .Set(u => u.UserName, usuario.username)
                    .Set(u => u.Email, usuario.email)
                    .Set(u => u.Descripcion, usuario.description)

                );

            return user.ModifiedCount > 0;


        }

        public async Task<UserResponse?> ObtenerUsuarioPorId(string idUsuario)
        {
            var user = await _conexion.Find(x => x.Id == idUsuario).FirstOrDefaultAsync();
            if (user == null)
            {
                return null;
            }
            var torneos = _torneos.FindAsync(x => user.Torneos.Contains(x.Id)).Result.ToList();

            var listaTorneos = torneos.Select(t => new RespuestaTorneo
            {
                Id = t.Id,
                Nombre = t.Nombre,
                Descripcion = t.Descripcion,
                FechaInicio = t.FechaInicio,
                FechaFin = t.FechaFin,
                Estado = t.Estado,
                Participantes = t.Participantes
            }).ToList();

            var userResponse = new UserResponse
            {
                Id = user.Id,
                username = user.UserName,
                email = user.Email,
                description = user.Descripcion,
                tournaments = listaTorneos ,
                tournamentsWon = user.TournamentsWon,
                tournamentsJoined = user.TournamentsJoined
            };
            return userResponse;
        }
    }
}
