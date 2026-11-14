export interface Cliente {
  id: string;
  nombre: string;
  sector: string;
  ciudad: string;
  fecha_primera_compra: string;
  es_base_instalada: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio_usd: number;
  /** "producto" (compra única) o "servicio recurrente" (licencias, soporte, suscripciones). */
  tipo: string;
}

export interface Venta {
  id: string;
  fecha: string;
  id_cliente: string;
  id_producto: string;
  cantidad: number;
  valor_usd: number;
  valor_cop: number;
}

export interface Trm {
  fecha: string;
  valor: number;
}
