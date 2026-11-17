import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, NgZone, ChangeDetectorRef, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, take, timeout, timer } from 'rxjs';

import { TrabajoService } from '../../services/trabajo';
import { TrabajoRequestModel } from '../../models/trabajo-request-model';
import { TrabajoModel } from '../../models/trabajo-model';
import { Calendario } from '../../../components/calendario/calendario';
import { TecnicoService } from '../../../tecnico/services/tecnico';
import { AlertaService } from '../../../shared/alertas/service/alerta-service';
@Component({
  selector: 'app-form-trabajo',
  standalone: true,
  imports: [ReactiveFormsModule, Calendario],
  templateUrl: './form-trabajo.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './form-trabajo.css',
})
export class FormTrabajo implements OnInit {

  @Input() uuidPresupuestoPreset = '';
  @Input() esModal = false;

  @Output() trabajoCreado = new EventEmitter<TrabajoModel>();
  @Output() cerrar = new EventEmitter<void>();
private alertaService = inject(AlertaService);
  
  uuidPresupuesto = '';

  descripcionTrabajo: FormControl;
  fechaEstimadaInicio: FormControl;
  fechaEstimadaFin: FormControl;

  formulario: FormGroup;

  cargando = false;
  mensajeExito = '';
  mensajeError = '';
  puedeCrearTrabajo = false;
  verificandoDatosCobro = true;

  constructor(
    public tService: TrabajoService,
    private route: ActivatedRoute,
    private tecnicoService : TecnicoService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.descripcionTrabajo = new FormControl('', [
      Validators.required,
      Validators.minLength(50),
      Validators.maxLength(1000)
    ]);

    this.fechaEstimadaInicio = new FormControl('', [
      Validators.required
    ]);

    this.fechaEstimadaFin = new FormControl('', [
      Validators.required
    ]);

    this.formulario = new FormGroup({
      descripcionTrabajo: this.descripcionTrabajo,
      fechaEstimadaInicio: this.fechaEstimadaInicio,
      fechaEstimadaFin: this.fechaEstimadaFin
    });
  }

  ngOnInit(): void {
    if (this.uuidPresupuestoPreset) {
      this.uuidPresupuesto = this.uuidPresupuestoPreset;
    } else {
      this.route.paramMap.subscribe(params => {
        this.uuidPresupuesto = params.get('uuid') ?? '';
      });
    }

    this.verificarDatosCobro();
  }

  manejarEnvio(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (this.verificandoDatosCobro) {
      return;
    }

    if (!this.puedeCrearTrabajo) {
      this.mensajeError =
        'Debés cargar tu Alias o CVU antes de crear un trabajo.';
        this.alertaService.error(this.mensajeError);
      return;
    }

    if (!this.uuidPresupuesto) {
      this.mensajeError = 'No se recibió el UUID del presupuesto.';
      return;
    }

    const trabajo: TrabajoRequestModel = {
      uuidPresupuesto: this.uuidPresupuesto,
      descripcionTrabajo: this.descripcionTrabajo.value,
      fechaEstimadaInicio: this.fechaEstimadaInicio.value,
      fechaEstimadaFin: this.fechaEstimadaFin.value
    };

    if (
      new Date(trabajo.fechaEstimadaFin) <
      new Date(trabajo.fechaEstimadaInicio)
    ) {
      this.mensajeError =
        'La fecha de finalización no puede ser anterior a la fecha de inicio.';
      this.alertaService.error(this.mensajeError);
        return;
    }

    this.cargando = true;

    forkJoin({
      respuesta: this.tService.storeTrabajo(trabajo),
      espera: timer(1500)
    }).subscribe({
      next: ({ respuesta }) => {
        this.cargando = false;
        this.mensajeExito = '¡Trabajo registrado correctamente!';
        this.alertaService.exito(this.mensajeExito);

        this.formulario.reset({
          descripcionTrabajo: '',
          fechaEstimadaInicio: '',
          fechaEstimadaFin: ''
        });

        if (this.trabajoCreado.observed) {
          this.trabajoCreado.emit(respuesta);
        }
      },
      error: (e) => {
        console.error('Error al registrar trabajo', e);
        this.cargando = false;
        this.mensajeError =
          e?.error?.mensaje || 'No se pudo registrar el trabajo. Intentá nuevamente.';
        this.alertaService.error(this.mensajeError);
        }
    });
  }

  cancelar(): void {
    this.cerrar.emit();
  }

      verificarDatosCobro(): void {
      console.log('Iniciando verificación de datos de cobro');

      this.tecnicoService.obtenerDatosCobro()
        .pipe(timeout({ first: 10000 }), take(1))
        .subscribe({
          next: (datos) => {
            this.ngZone.run(() => {
              console.log('Datos de cobro recibidos:', datos);

              this.puedeCrearTrabajo = !!(
                datos.alias?.trim() || datos.cvu?.trim()
              );

              this.verificandoDatosCobro = false;

              console.log('¿Puede crear trabajo?', this.puedeCrearTrabajo);

              this.cdr.detectChanges();

              if (!this.puedeCrearTrabajo) {
                this.router.navigate(['/tecnico/datos-cobro']);
              }
            });
          },
          error: (error) => {
            this.ngZone.run(() => {
              console.error('Error al verificar datos de cobro:', error);

              this.verificandoDatosCobro = false;
              this.puedeCrearTrabajo = false;

              this.cdr.detectChanges();

              this.router.navigate(['/tecnico/datos-cobro']);
            });
          }
        });
    }

  canDeactivate(): boolean {
    if (this.formulario.dirty) {
      return window.confirm(
        '¿Estás seguro de que querés salir del formulario? Los cambios podrían perderse.'
      );
    }
    return true;
  }
}