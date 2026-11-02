export interface Plan {
  id: 'usuario' | 'duo';
  titulo: string;
  descripcion: string;
  beneficios: string[];
  imagen: string;
  boton: string;
  invertido: boolean;
  ruta: string;
}