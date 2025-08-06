using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ModeloCategorias
    {
        public int id_categoria { get; set; }
        public string categoria { get; set; }

        public List<ModeloDeportes> deportes { get; set; }
    }
}
