using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using DA.Entidades;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DA.Entidades;

namespace DA.Categorias
{
    public class CategoriaDA : ICategoriaDA
    {
        private readonly IMongoCollection<DA.Entidades.Categorias> _coleccionCategorias;

        public CategoriaDA(IMongoDbContext context)
        {
            _coleccionCategorias = context.GetCollection<DA.Entidades.Categorias>("categorias");
        }
        public async Task<List<ModeloCategorias>> ObtenerCategorias()
        {
            var categorias = await _coleccionCategorias.Find(_ => true).ToListAsync();
            return categorias.Select(c => new ModeloCategorias

            {
                id_categoria = c.id_categoria,
                categoria = c.categoria,
                deportes = c.deportes.Select(d => new ModeloDeportes
                {
                    nombre = d.nombre,
                    
                }).ToList()
            }
            ).ToList();


        }

    }
}
