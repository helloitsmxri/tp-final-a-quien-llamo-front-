export interface Dia {
  numero: number;     // 1, 2, 3...
  fecha: string;      // '2002-10-12'
  otroMes: boolean;   // true si es de un mes anterior o siguiente (se ve gris)
  futuro: boolean;    // true si es después de hoy (no se puede elegir)
}