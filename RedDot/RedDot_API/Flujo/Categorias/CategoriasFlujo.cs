using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Flujo.Categorias
{
    public class CategoriasFlujo : ICategoriasFlujo
    {
        private readonly ICategoriaDA _categoriaDA;

        public CategoriasFlujo(ICategoriaDA categoriaDA)
        {
            _categoriaDA = categoriaDA;
        }

        public async Task<List<ModeloCategorias>> ObtenerCategorias()
        {
            return await _categoriaDA.ObtenerCategorias();
        }

        public async Task<List<ModeloDeportes>> ObtenerDeportes()
        {
            return await _categoriaDA.ObtenerDeportes();
        }
    }
}
