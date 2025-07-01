using System.Text;
using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Amazon.Auth.AccessControlPolicy;
using DA.Authentication;
using DA.Repositorio;
using DA.Usuarios;
using Flujo.Authentication;
using Flujo.Usuarios;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

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

#region Dependency Injection


builder.Services.AddScoped<IUsuariosDA, UsuariosDA>();
builder.Services.AddScoped<IUsuariosFlujo,UsuariosFlujo>();
builder.Services.AddScoped<IAuthenticationDA, AuthenticationDA>();
builder.Services.AddScoped<IAuthenticationFlujo, AuthenticationFlujo>();

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
            OnTokenValidated = async context =>
            {
                var claimsIdentity = context.Principal.Identity as System.Security.Claims.ClaimsIdentity;
                var userName = claimsIdentity?.Name;

                var userRole = await context.HttpContext.RequestServices
                    .GetRequiredService<IAuthenticationFlujo>()
                    .GetRole(userName);

                if (!string.IsNullOrEmpty(userRole))
                {
                    claimsIdentity.AddClaim(new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, userRole));
                }
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
