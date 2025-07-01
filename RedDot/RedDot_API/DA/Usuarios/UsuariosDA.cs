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
        private readonly MongoDbContext _context;
        private readonly IMongoCollection<User> _conexion;
        private readonly IConfiguration _configuracion;


        public UsuariosDA(IConfiguration configuration)
        {
            this._configuracion = configuration; 
            this._context = new MongoDbContext(configuration);
               
            this._conexion = _context.Users;
        }
        public async Task<TokenDTO> Login(UserBase usuario)
        {

            var usuarioDB = await _conexion.Find(x => x.UserName == usuario.UserName).FirstOrDefaultAsync();

            if (usuarioDB == null)
            {
                return new TokenDTO { ValidationSuccess = false,AccessToken = string.Empty };
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
                    Password = usuario.Password

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

        private async Task<List<Claim>> ClaimsGeneration(User user)
        {
            var claims = new List<Claim>
        {
            
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Email, user.Email),
            
        };


            return claims;

        }
    }
}
