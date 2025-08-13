using System.Text;
using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Amazon.Auth.AccessControlPolicy;
using DA.Authentication;
using DA.Categorias;
using DA.Repositorio;
using DA.Torneos;
using DA.Usuarios;
using Flujo.Authentication;
using Flujo.Categorias;
using Flujo.Torneos;
using Flujo.Usuarios;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using Newtonsoft.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:55034")
              .AllowAnyHeader()
              .AllowAnyMethod()
               .AllowCredentials();
    });
});
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var connectionString = config["RedDotDatabase:ConnectionString"];
    return new MongoClient(connectionString);
});
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.TypeNameHandling = TypeNameHandling.Auto;
    });
#region Dependency Injection

// Usuarios
builder.Services.AddScoped<IUsuariosDA, UsuariosDA>();
builder.Services.AddScoped<IUsuariosFlujo, UsuariosFlujo>();

// Autenticación
builder.Services.AddScoped<IAuthenticationDA, AuthenticationDA>();
builder.Services.AddScoped<IAuthenticationFlujo, AuthenticationFlujo>();

// Torneos
builder.Services.AddScoped<ITorneosDA, TorneosDA>();
builder.Services.AddScoped<ITorneosFlujo, TorneosFlujo>();

// Contexto MongoDB
builder.Services.AddScoped<IMongoDbContext, MongoDbContext>();

builder.Services.AddScoped<ICategoriaDA, CategoriaDA>();
builder.Services.AddScoped<ICategoriasFlujo, CategoriasFlujo>();


#endregion

#region TokenMiddleware

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Token:Issuer"],
            ValidAudience = builder.Configuration["Token:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Token:Key"])),

        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Request.Headers.TryGetValue("Authorization", out var BearerToken);
                if (BearerToken.Count == 0)
                    BearerToken = "no Bearer token sent\n";
                return Task.CompletedTask;
            }
        };
    });

#endregion

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("PermitirFrontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();