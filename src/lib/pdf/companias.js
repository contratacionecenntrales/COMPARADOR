// Compañías con las que trabajamos/comparamos, agrupadas por sector.
// El logo es opcional: si en src/assets/companies/ existe un archivo con la
// clave indicada (p. ej. "endesa.png"), el informe lo usa automáticamente;
// si no existe, se dibuja una pastilla con el nombre como respaldo. Así el
// listado queda listo para funcionar en cuanto se suban los logos reales
// (ver src/assets/companies/README.md).
export const COMPANIAS_POR_SECTOR = [
  {
    sector: 'energia',
    etiqueta: 'Energía',
    empresas: [
      { clave: 'endesa', nombre: 'Endesa' },
      { clave: 'iberdrola', nombre: 'Iberdrola' },
      { clave: 'naturgy', nombre: 'Naturgy' },
    ],
  },
  {
    sector: 'telefonia',
    etiqueta: 'Telefonía',
    empresas: [
      { clave: 'movistar', nombre: 'Movistar' },
      { clave: 'vodafone', nombre: 'Vodafone' },
      { clave: 'orange', nombre: 'Orange' },
    ],
  },
  {
    sector: 'alarmas',
    etiqueta: 'Alarmas',
    empresas: [
      { clave: 'securitas', nombre: 'Securitas Direct' },
      { clave: 'prosegur', nombre: 'Prosegur' },
    ],
  },
]

// Descubre en tiempo de build los logos disponibles en src/assets/companies/
// (clave -> URL del asset). Si la carpeta está vacía, devuelve un objeto
// vacío y el informe usa pastillas de texto para todas las compañías.
const modulosLogos = import.meta.glob('../../assets/companies/*.{png,jpg,jpeg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const LOGOS_COMPANIAS = Object.entries(modulosLogos).reduce((acc, [ruta, url]) => {
  const clave = ruta.split('/').pop().replace(/\.(png|jpe?g|svg)$/i, '').toLowerCase()
  acc[clave] = url
  return acc
}, {})
