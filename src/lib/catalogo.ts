/**
 * Traducciones del catálogo: categorías, sectores, tipos y nombres de productos.
 * Los datos se guardan en español; esto solo cambia cómo se muestran.
 * Los nombres de clientes («Cliente 23») no se traducen: son identificadores del sistema.
 */
type Idioma = 'es' | 'en';

const CATEGORIAS: Record<string, string> = {
  Redes: 'Networking',
  Nube: 'Cloud',
  Ciberseguridad: 'Cybersecurity',
  Hardware: 'Hardware',
  Software: 'Software',
  Almacenamiento: 'Storage',
};

const SECTORES: Record<string, string> = {
  salud: 'healthcare',
  'educación': 'education',
  retail: 'retail',
  manufactura: 'manufacturing',
  gobierno: 'government',
  financiero: 'financial',
};

const PRODUCTOS: Record<string, string> = {
  'Switch administrable 48 puertos': '48-port managed switch',
  'Access point Wi-Fi 6': 'Wi-Fi 6 access point',
  'Router empresarial SD-WAN': 'SD-WAN enterprise router',
  'Cableado estructurado (punto)': 'Structured cabling (per drop)',
  'Suscripción nube privada (mes)': 'Private cloud subscription (month)',
  'Migración a la nube': 'Cloud migration',
  'Respaldo en la nube (TB/año)': 'Cloud backup (TB/year)',
  'Firewall de nueva generación': 'Next-generation firewall',
  'Antivirus empresarial (licencia)': 'Enterprise antivirus (license)',
  'Auditoría de seguridad': 'Security audit',
  'Servidor rack 2U': '2U rack server',
  'Portátil corporativo': 'Corporate laptop',
  'Estación de trabajo': 'Workstation',
  'Licencia ofimática (usuario/año)': 'Office suite license (user/year)',
  'Licencia de virtualización': 'Virtualization license',
  'Soporte y mesa de ayuda (mes)': 'Support and help desk (month)',
  'Arreglo de almacenamiento NAS': 'NAS storage array',
  'Discos SSD empresariales': 'Enterprise SSD drives',
  'Almacenamiento SAN': 'SAN storage',
  'Unidad de cintas de respaldo': 'Backup tape drive',
};

export const categoria = (c: string, i: Idioma) => (i === 'en' ? (CATEGORIAS[c] ?? c) : c);
export const sector = (s: string, i: Idioma) => (i === 'en' ? (SECTORES[s] ?? s) : s);
export const producto = (nombre: string, i: Idioma) => (i === 'en' ? (PRODUCTOS[nombre] ?? nombre) : nombre);
export const tipoProducto = (t: string, i: Idioma) =>
  t === 'servicio recurrente' ? (i === 'es' ? 'Recurrente' : 'Recurring') : i === 'es' ? 'Producto' : 'Product';
