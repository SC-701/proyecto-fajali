﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using DA.Entidades;
using DA.Repositorio;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace DA.Authentication
{
    public class AuthenticationDA : IAuthenticationDA
    {
       
        private readonly IMongoCollection<User> users;
        private readonly IMongoCollection<Roles> roles;
        private readonly IMongoCollection<Role_users> rolesuser;
  


        public AuthenticationDA(IMongoDbContext context,IConfiguration configuration)
        {
            
            this.users = context.GetCollection<User>("users");
            this.roles = context.GetCollection<Roles>("roles");
            this.rolesuser = context.GetCollection<Role_users>("roles_users");
        }
        public async Task<string> GetRole(string username)
        {
            
            var usuarioDB = await users.Find(x=> x.UserName == username).FirstOrDefaultAsync();
            var roleUser = await rolesuser.Find(x => x.IdUser == usuarioDB.Id).FirstOrDefaultAsync();
            var role = await roles.Find(x => x.Id == roleUser.IdRole).FirstOrDefaultAsync();

            return role.RoleName;
        }

        
    }
}
