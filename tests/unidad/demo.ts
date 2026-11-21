/** Datos de la demo original (los mismos archivos que usa la web). */
import clientesJson from '../../src/data/clientes.json';
import productosJson from '../../src/data/productos.json';
import ventasJson from '../../src/data/ventas.json';
import trmJson from '../../src/data/trm.json';
import metaJson from '../../src/data/meta.json';
import type { Cliente, Producto, Trm, Venta } from '../../src/lib/types';

export const clientes = clientesJson as Cliente[];
export const productos = productosJson as Producto[];
export const ventas = ventasJson as Venta[];
export const trm = trmJson as Trm[];
export const HOY = new Date(`${metaJson.fecha_corte}T00:00:00Z`);
