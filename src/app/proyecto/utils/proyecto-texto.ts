import { ProyectoModel } from '../models/ProyectoModel';
/*el back guarda los proyectos como un unico texto (campo `proyectos` del tecnico):
 una linea por proyecto con el formato "Titulo — detalle".
 estas funciones convierten entre ese texto y una lista de proyectos. */
export const SEPARADOR = ' — ';
export const MIN_TEXTO = 10;   // min que exige el back para todo el texto
export const MAX_TEXTO = 5000; // max que exige el back para todo el texto
/*texto del back -> lista de proyectos */
export function parsearProyectos(texto: string | null | undefined): ProyectoModel[] {
  return (texto ?? '')
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean)
    .map((linea) => {
      const i = linea.indexOf(SEPARADOR);
      if (i === -1) {
        return { titulo: linea, detalle: '' };
      }
      return {
        titulo: linea.slice(0, i).trim(),
        detalle: linea.slice(i + SEPARADOR.length).trim(),
      };
    });
}

/* lista de proyectos -> texto para el back */
export function serializarProyectos(lista: ProyectoModel[]): string {
  return lista
    .map((p) => (p.detalle ? `${p.titulo}${SEPARADOR}${p.detalle}` : p.titulo))
    .join('\n');
}

/*un proyecto ocupa una sola linea: los saltos de linea se reemplazan por espacios */
export function limpiarLinea(valor: string): string {
  return valor.replace(/\s*[\r\n]+\s*/g, ' ').trim();
}