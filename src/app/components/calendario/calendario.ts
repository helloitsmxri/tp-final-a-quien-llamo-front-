import { Component, ElementRef, forwardRef, inject, HostListener} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Dia } from './model/Dia';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css',
  providers:[{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Calendario), multi:true}]
})
export class Calendario {
  private el = inject(ElementRef);
 
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
 
  hoy = new Date();
  anioHoy = this.hoy.getFullYear();
  hoyTexto = this.formato(this.hoy.getFullYear(), this.hoy.getMonth(), this.hoy.getDate());
 
  abierto = false;       // ¿está desplegado el calendario?
  vistaAnios = false;    // false = se ven los días, true = se ven los años
 
  mes = this.hoy.getMonth();      // mes que se está mirando (0 = enero)
  anio = this.hoy.getFullYear();  // año que se está mirando
  inicioAnios = 0;                // primer año de la grilla de años
 
  seleccionada = '';     // fecha elegida, formato 'YYYY-MM-DD' (igual que un input date)
  dias: Dia[] = [];
  deshabilitado = false;
 
  // Funciones que Angular nos da para avisarle al formulario
  private onChange: (valor: string) => void = () => {};
  private onTouched: () => void = () => {};
 
  constructor() {
    this.generarDias();
  }
 
  // ---------- Conexión con el formulario ----------
 
  writeValue(valor: string | null): void {
    this.seleccionada = valor ?? '';
 
    const partes = this.seleccionada.split('-').map(Number);
    if (partes.length === 3 && !partes.some(isNaN)) {
      this.anio = partes[0];
      this.mes = partes[1] - 1;
    }
 
    this.generarDias();
  }
 
  registerOnChange(fn: (valor: string) => void): void {
    this.onChange = fn;
  }
 
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
 
  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado = deshabilitado;
  }
 
  // ---------- Textos para mostrar ----------
 
  // Lo que se ve dentro del campo: 12/10/2002
  get textoCampo(): string {
    if (!this.seleccionada) return '';
    const [a, m, d] = this.seleccionada.split('-');
    return `${d}/${m}/${a}`;
  }
 
  get anioSeleccionado(): number {
    return this.seleccionada ? Number(this.seleccionada.slice(0, 4)) : 0;
  }
 
  // Los 12 años que se muestran en la vista de años
  get anios(): number[] {
    return Array.from({ length: 12 }, (_, i) => this.inicioAnios + i);
  }
 
  // ---------- Abrir y cerrar ----------
 
  alternar(): void {
    if (this.deshabilitado) return;
 
    if (this.abierto) {
      this.cerrar();
    } else {
      this.abierto = true;
      this.vistaAnios = false;
    }
  }
 
  cerrar(): void {
    this.abierto = false;
    this.vistaAnios = false;
    this.onTouched();
  }
 
  // Cierra el calendario si hacen clic afuera
  @HostListener('document:click', ['$event'])
  clicAfuera(evento: Event): void {
    if (this.abierto && !evento.composedPath().includes(this.el.nativeElement)) {
      this.cerrar();
    }
  }
 
  @HostListener('keydown.escape')
  alApretarEscape(): void {
    if (this.abierto) this.cerrar();
  }
 
  // ---------- Navegación ----------
 
  anterior(): void {
    if (this.vistaAnios) {
      this.inicioAnios -= 12;
      return;
    }
 
    this.mes--;
    if (this.mes < 0) {
      this.mes = 11;
      this.anio--;
    }
    this.generarDias();
  }
 
  siguiente(): void {
    if (this.vistaAnios) {
      this.inicioAnios += 12;
      return;
    }
 
    this.mes++;
    if (this.mes > 11) {
      this.mes = 0;
      this.anio++;
    }
    this.generarDias();
  }
 
  // Al hacer clic en el título ("Octubre del 2002") cambia entre días y años
  alternarAnios(): void {
    this.vistaAnios = !this.vistaAnios;
 
    if (this.vistaAnios) {
      this.inicioAnios = this.anio - (this.anio % 12);
    }
  }
 
  elegirAnio(anio: number): void {
    this.anio = anio;
    this.vistaAnios = false;
    this.generarDias();
  }
 
  // ---------- Elegir un día ----------
 
  elegir(dia: Dia): void {
    if (dia.futuro) return;
 
    this.seleccionada = dia.fecha;
 
    const [a, m] = dia.fecha.split('-').map(Number);
    this.anio = a;
    this.mes = m - 1;
    this.generarDias();
 
    this.onChange(dia.fecha);   // le avisa al formulario el nuevo valor
    this.cerrar();
  }
 
  // ---------- Armado de la grilla ----------
 
  // Siempre arma 42 casilleros (6 filas x 7 días), empezando en lunes
  private generarDias(): void {
    // getDay(): domingo = 0. Lo convierto para que lunes = 0
    const corrimiento = (new Date(this.anio, this.mes, 1).getDay() + 6) % 7;
 
    this.dias = [];
 
    for (let i = 0; i < 42; i++) {
      const d = new Date(this.anio, this.mes, 1 - corrimiento + i);
      const fecha = this.formato(d.getFullYear(), d.getMonth(), d.getDate());
 
      this.dias.push({
        numero: d.getDate(),
        fecha,
        otroMes: d.getMonth() !== this.mes,
        futuro: fecha > this.hoyTexto,
      });
    }
  }
 
  // Arma el texto '2002-10-05' a partir de año, mes (0-11) y día
  private formato(anio: number, mes: number, dia: number): string {
    const dos = (n: number) => String(n).padStart(2, '0');
    return `${anio}-${dos(mes + 1)}-${dos(dia)}`;
  }
 
}
