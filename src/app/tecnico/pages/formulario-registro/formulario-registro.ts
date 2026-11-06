import { Component, QueryList, ViewChildren, inject } from '@angular/core';
import { DetalleHabilidad } from '../../../habilidad/pages/detalle-habilidad/detalle-habilidad';
import { DetalleEspecialidad } from '../../../especialidad/pages/detalle-especialidad/detalle-especialidad';
import { DetalleRubro } from '../../../rubro/pages/detalle-rubro/detalle-rubro';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TecnicoService } from '../../services/tecnico';
import { Router } from '@angular/router';
import { RubroModel } from '../../../rubro/models/rubro-model';
import { EspecialidadModel } from '../../../especialidad/models/especialidad-model';
import { CertificacionService } from '../../../certificacion/services/certificacion';
import { PortfolioService } from '../../../portfolio/services/portfolio';
import { CertificacionDatos } from '../../../certificacion/models/certificacion-datos';
import { PortfolioDatos } from '../../../portfolio/models/portfolio-datos';
import { CertificacionForm } from '../../../certificacion/pages/certificacion-form/certificacion-form';
import { FormPortfolio } from '../../../portfolio/pages/form-portfolio/form-portfolio';
import { forkJoin, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../auth/services/auth-service';
import { SelectorServicios } from '../../../selector-servicios/selector-servicios';
import { Calendario } from '../../../components/calendario/calendario';
import { TipoValidacion } from '../../../especialidad/enum/tipo-validacion';
import { ProyectoModel } from '../../../proyecto/models/ProyectoModel';
import {
  MAX_TEXTO,
  MIN_TEXTO,
  SEPARADOR,
  limpiarLinea,
  serializarProyectos,
} from '../../../proyecto/utils/proyecto-texto';
import { soloLetras, contieneLetras, validarEdad, TIPOS_IMAGEN, MAX_FOTO_MB } from '../../../utils/validadores-texto';

const CLAVE= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
function clavesIguales(grupo: AbstractControl): ValidationErrors | null {
  return grupo.get('clave')?.value === grupo.get('repetirClave')?.value
    ? null
    : { clavesDistintas: true };
}

//el — es el separador entre titulo y detalle, asi q no puede estar en el titulo
function sinSeparador(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').includes(SEPARADOR) ? { separador: true } : null;
}

type EspecialidadElegida = { uuid: string; nombre: string; tipoValidacion: TipoValidacion | null };

// Un paso de documentacion. Hay uno por cada especialidad que exige certificado o portfolio.
// Si ninguna exige nada, hay dos pasos opcionales (uno de certificacion y otro de portfolio).
type PasoDocumentacion = {
  clave: string;                                      // identifica el paso (para que no se pierda lo cargado al volver)
  tipo: 'certificacion' | 'portfolio';
  obligatorio: boolean;
  especialidad: EspecialidadElegida | null;           // null en los pasos opcionales
  opcionesPortfolio: { uuid: string; nombre: string }[]; // lo que se ofrece en el desplegable del portfolio
  opcionesCertificacion: { uuid: string; nombre: string }[]; // lo que se ofrece en el desplegable de la certificación
};

@Component({
  selector: 'app-formulario-registro',
  imports: [ReactiveFormsModule, SelectorServicios, Calendario, CertificacionForm, FormPortfolio],
  templateUrl: './formulario-registro.html',
  styleUrl: './formulario-registro.css',
})
export class FormularioRegistro {
  private servicioTecnico = inject(TecnicoService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  private servicioCertificacion=inject(CertificacionService)
  private servicioPortfolio=inject(PortfolioService)

  private auth = inject(AuthService);

  //hay un formulario de cada tipo por cada paso de documentacion, en el orden en que aparecen
  @ViewChildren(CertificacionForm) certificaciones!: QueryList<CertificacionForm>;
  @ViewChildren(FormPortfolio) portfolios!: QueryList<FormPortfolio>;

  foto: File | null = null;

  //pasos: del 1 al 3 son fijos; despues hay un paso por cada documentacion que piden las especialidades
  paso=1

  private camposPorPaso: Record<number, string[]>={
    1: ['email', 'clave', 'repetirClave', 'nombre', 'apellido'],
    2: ['dni', 'fechaNacimiento', 'telefono', 'sobreMi'],
    3: ['cuit', 'descripcionTrabajo', 'proyectos']
  }

  formulario = this.fb.group({
     email: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(8), Validators.pattern(CLAVE)]],
      repetirClave: ['', [Validators.required]],
      nombre: ['', [Validators.required, Validators.minLength(2), soloLetras]],
      apellido: ['', [Validators.required, Validators.minLength(2), soloLetras]],

      // Paso 2: datos personales
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      fechaNacimiento: ['', [Validators.required, validarEdad]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      sobreMi: ['', [Validators.required, Validators.maxLength(500), contieneLetras]],

      // Paso 3: datos de tecnico
      cuit: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      descripcionTrabajo: ['', [Validators.required, Validators.minLength(10), contieneLetras]],
      // guarda el texto final de los proyectos ("Titulo — detalle", una linea por proyecto)
      proyectos: ['', [Validators.maxLength(MAX_TEXTO)]],
    },
    { 
      validators: clavesIguales 
    }
  );

  especialidadesDelRubro: string[]=[]
  nombresEspecialidades: string[]=[]
  uuidEspecialidades: string[]=[]
  uuidHabilidades: string[]=[]
  errorSeleccion: string | null = null;
  errorServidor: string | null = null;
  enviado=false
  avisoDocumentacion: string | null = null;
  errorDocumentacion: string | null = null;

  // true cuando el back ya creo la cuenta (para saber si un error posterior es de registro o de lo que sigue)
  private cuentaCreada = false;

  // las especialidades del paso 3, con su tipo de validación, definen qué documentación se pide.
  // Los pasos se calculan una sola vez en onEspecialidades (y no en getters) para que los
  // [especialidades] del portfolio no reciban un array nuevo en cada ciclo de deteccion de cambios.
  especialidadesElegidas: EspecialidadElegida[] = [];
  pasosDocumentacion: PasoDocumentacion[] = [
    // mientras no eligio especialidades: los dos pasos opcionales
    { clave: 'certificacion-opcional', tipo: 'certificacion', obligatorio: false, especialidad: null, opcionesPortfolio: [], opcionesCertificacion: [] },
    { clave: 'portfolio-opcional', tipo: 'portfolio', obligatorio: false, especialidad: null, opcionesPortfolio: [], opcionesCertificacion: [] },
  ];

  // con varios rubros, las especialidades disponibles son las de todos, sin repetir
  onRubros(rubros: RubroModel[]): void {
    const nombres = rubros.flatMap((r) => r.especialidades ?? []);
    this.especialidadesDelRubro = [...new Set(nombres)];
  }

  onEspecialidades(lista: EspecialidadModel[]): void {
    this.uuidEspecialidades = lista.map(e => e.uuid);
    this.nombresEspecialidades = lista.map(e => e.nombreEspecialidad);

    this.especialidadesElegidas = lista.map(e => ({
      uuid: e.uuid,
      nombre: e.nombreEspecialidad,
      tipoValidacion: e.tipoValidacion,
    }));
    this.armarPasosDocumentacion();
  }

  // un paso por cada especialidad que se valida con certificado y otro por cada una que se valida con portfolio
  private armarPasosDocumentacion(): void {
    const pasos: PasoDocumentacion[] = [];

    this.especialidadesElegidas
      .filter(e => e.tipoValidacion === TipoValidacion.Certificado)
      .forEach(e => pasos.push({
        clave: `certificacion-${e.uuid}`, tipo: 'certificacion', obligatorio: true, especialidad: e, opcionesPortfolio: [],
        opcionesCertificacion: [{ uuid: e.uuid, nombre: e.nombre }],
      }));

    this.especialidadesElegidas
      .filter(e => e.tipoValidacion === TipoValidacion.Portfolio)
      .forEach(e => pasos.push({
        clave: `portfolio-${e.uuid}`, tipo: 'portfolio', obligatorio: true, especialidad: e,
        opcionesPortfolio: [{ uuid: e.uuid, nombre: e.nombre }], opcionesCertificacion: [],
      }));

    // ninguna especialidad exige nada: se ofrecen los dos, opcionales
    if (pasos.length === 0) {
      pasos.push(
        {
          clave: 'certificacion-opcional', tipo: 'certificacion', obligatorio: false, especialidad: null, opcionesPortfolio: [],
          opcionesCertificacion: this.especialidadesElegidas.map(e => ({ uuid: e.uuid, nombre: e.nombre })),
        },
        {
          clave: 'portfolio-opcional', tipo: 'portfolio', obligatorio: false, especialidad: null,
          opcionesPortfolio: this.especialidadesElegidas.map(e => ({ uuid: e.uuid, nombre: e.nombre })),
          opcionesCertificacion: [],
        },
      );
    }

    this.pasosDocumentacion = pasos;
  }

  onHabilidades(uuid: string[]): void {
    this.uuidHabilidades = uuid;
  }

    // ---------- proyectos ----------
  proyectos: ProyectoModel[] = [];

  // los dos campos para escribir un proyecto nuevo (no son parte del formulario principal)
  // igual que en el componente Proyecto: el titulo ya no es obligatorio al salir del campo
  tituloProyecto = new FormControl('', [Validators.maxLength(100), sinSeparador, contieneLetras]);
  detalleProyecto = new FormControl('', [Validators.maxLength(200), contieneLetras]);

  agregarProyecto(): void {
    this.tituloProyecto.markAsTouched();
    this.detalleProyecto.markAsTouched();

    const titulo = limpiarLinea(this.tituloProyecto.value ?? '');

    // se apretó "Agregar" sin título: el aviso se limpia solo cuando empieza a escribir
    if (!titulo) {
      this.tituloProyecto.setErrors({ vacio: true });
      return;
    }

    if (this.tituloProyecto.invalid || this.detalleProyecto.invalid) return;

    this.proyectos = [
      ...this.proyectos,
      {
        titulo,
        detalle: limpiarLinea(this.detalleProyecto.value ?? ''),
      },
    ];
    this.tituloProyecto.reset('');
    this.detalleProyecto.reset('');
    this.sincronizarProyectos();
  }

  quitarProyecto(indice: number): void {
    this.proyectos = this.proyectos.filter((_, i) => i !== indice);
    this.sincronizarProyectos();
  }

  // el control "proyectos" del formulario guarda el texto final que se envia al back
  private sincronizarProyectos(): void {
    const control = this.formulario.controls.proyectos;
    control.setValue(serializarProyectos(this.proyectos));
    control.markAsTouched();
  }

  errorTituloProyecto(): string {
    const c = this.tituloProyecto;
    if (c.hasError('vacio')) return 'Escribí un título para agregar el proyecto.';
    if (c.hasError('maxlength')) return 'El título no debe superar los 100 caracteres.';
    if (c.hasError('separador')) return 'El título no puede contener " — ".';
    if (c.hasError('sinLetras')) return 'El título tiene que incluir letras, no puede ser solo números.';
    return '';
  }

  errorDetalleProyecto(): string {
    const c = this.detalleProyecto;
    if (!c.touched) return '';
    if (c.hasError('maxlength')) return 'El detalle no debe superar los 200 caracteres.';
    if (c.hasError('sinLetras')) return 'El detalle tiene que incluir letras, no puede ser solo números.';
    return '';
  }

  errorProyectos(): string | null {
    const c = this.formulario.controls.proyectos;
    if (!c.touched || !c.errors) return null;
    if (c.hasError('maxlength')) return `Los proyectos no pueden superar los ${MAX_TEXTO} caracteres en total.`;
    return null;
  }

 
  get totalPasos(): number {
    return 3 + this.pasosDocumentacion.length;
  }

  // el paso de documentacion que se esta mostrando (null en los pasos 1 a 3)
  get pasoDocumentacionActual(): PasoDocumentacion | null {
    return this.paso > 3 ? this.pasosDocumentacion[this.paso - 4] ?? null : null;
  }

  // el formulario de un paso es el N-esimo de su tipo: se cuentan los pasos del mismo tipo que lo preceden
  private indiceEnSuTipo(indicePaso: number): number {
    const tipo = this.pasosDocumentacion[indicePaso].tipo;
    return this.pasosDocumentacion.slice(0, indicePaso).filter(p => p.tipo === tipo).length;
  }

  errorMensaje(campo: string): string | null {
    const c = this.formulario.get(campo);
    if (!c || !c.touched) return null;

    if (c.hasError('required')) return 'Este campo es obligatorio.';
    if (c.hasError('soloLetras')) return 'Solo se permiten letras.';
    if (c.hasError('sinLetras')) return 'Tiene que incluir letras, no puede ser solo números o símbolos.';
    if (c.hasError('menorDeEdad')) return 'Tenés que ser mayor de 18 años para poder registrarte en la plataforma.';

    if (campo === 'repetirClave' && this.formulario.hasError('clavesDistintas')) {
      return 'Las contraseñas no coinciden.';
    }
    if (c.hasError('email')) return 'Ingresá un email válido.';

    if (c.hasError('minlength')) {
      return `Debe tener al menos ${c.errors?.['minlength'].requiredLength} caracteres.`;
    }
    if (c.hasError('maxlength')) {
      return `No puede superar los ${c.errors?.['maxlength'].requiredLength} caracteres.`;
    }

    if (c.hasError('pattern')) {
      switch (campo) {
        case 'clave': return 'Debe tener mayúscula, minúscula, número y un carácter especial (@$!%*?&).';
        case 'dni': return 'El DNI debe tener 8 números.';
        case 'telefono': return 'El teléfono debe tener 10 números, sin guiones ni espacios.';
        case 'cuit': return 'El CUIT debe tener 11 números, sin guiones.';
      }
    }
    return null;
  }

  //navegar entre pasos
  private pasoValido(paso: number): boolean {
    if (paso > 3) {
      return this.validarPasoDocumentacion();
    }

    // si dejó un proyecto escrito sin apretar "Agregar", se agrega solo
    if (paso === 3 && this.tituloProyecto.value?.trim()) {
      this.agregarProyecto();
    }

    const controles=this.camposPorPaso[paso].map(campo => this.formulario.get(campo));
    controles.forEach(c=> c?.markAllAsTouched())

    const clavesConfirmadas= paso!==1 || !this.formulario.hasError('clavesDistintas');
    let valido=controles.every(c=>c?.valid) && clavesConfirmadas;

    if(paso===3){
      const haySeleccion=this.uuidEspecialidades.length>0 && this.uuidHabilidades.length>0;
      this.errorSeleccion=haySeleccion ? null: 'Elegí al menos una especialidad y una habilidad.';
      // si el titulo sigue escrito es que no paso la validacion y no se agrego
      const proyectoPendiente = !!this.tituloProyecto.value?.trim();
      valido=valido && haySeleccion && !proyectoPendiente;
    }
    return valido;
  }

  siguiente(): void {
    if(this.paso<this.totalPasos && this.pasoValido(this.paso)){
      this.paso++
    }
  }

  volver(): void {
    if(this.paso>1){
      this.paso--
      this.errorDocumentacion = null;
    }
  }

  errorFoto: string | null = null;

  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.errorFoto = null;

    if (!archivo) { this.foto = null; return; }

    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      this.errorFoto = 'Solo se aceptan imágenes (JPG, PNG o WEBP).';
      input.value = '';
      this.foto = null;
      return;
    }
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
      this.errorFoto = `La imagen no puede superar los ${MAX_FOTO_MB} MB.`;
      input.value = '';
      this.foto = null;
      return;
    }
    this.foto = archivo;
  }

  guardar(): void {
    //enter en los pasos anteriores al ultimo avanza en vez de enviar
    if (this.paso < this.totalPasos) {
      this.siguiente();
      return;
    }

    //el ultimo paso (el de documentacion) se valida aca; los anteriores ya se validaron al avanzar
    if (!this.pasoValido(this.paso)){
      return;
    } 

    if(this.formulario.invalid){
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorServidor = null;
    this.avisoDocumentacion = null;


    const v = this.formulario.getRawValue();
    const fd = new FormData();

    //el back usa @ModelAttribute: las claves llevan el prefijo "usuario." / "tecnico."
    fd.append('usuario.nombre', v.nombre ?? '');
    fd.append('usuario.apellido', v.apellido ?? '');
    fd.append('usuario.dni', v.dni ?? '');
    fd.append('usuario.email', v.email ?? '');
    fd.append('usuario.clave', v.clave ?? '');
    fd.append('usuario.telefono', v.telefono ?? '');
    fd.append('usuario.fechaNacimiento', v.fechaNacimiento ?? '');
    fd.append('usuario.sobreMi', v.sobreMi ?? '');
    if (this.foto) fd.append('usuario.foto', this.foto);

    fd.append('tecnico.cuit', v.cuit ?? '');
    fd.append('tecnico.descripcionTrabajo', v.descripcionTrabajo ?? '');
    fd.append('tecnico.proyectos', v.proyectos ?? '');
    //las listas se mandan repitiendo la clave
    this.uuidEspecialidades.forEach(u => fd.append('tecnico.uuidEspecialidades', u));
    this.uuidHabilidades.forEach(u => fd.append('tecnico.uuidHabilidades', u));

    //todos los documentos cargados (los pasos vacios y opcionales no mandan nada)
    const certificaciones = this.certificaciones.toArray()
      .map(c => c.datos())
      .filter((d): d is CertificacionDatos => d !== null);
    const portfolios = this.portfolios.toArray()
      .map(p => p.datos())
      .filter((d): d is PortfolioDatos => d !== null);

    this.enviado = true;
    this.cuentaCreada = false;

    // igual que en el registro de usuario: primero se crea la cuenta y despues se inicia sesion
    // (el login guarda el token). Con el token ya se puede subir la documentacion.
    this.servicioTecnico.crearTecnico(fd).pipe(
      tap(() => (this.cuentaCreada = true)),
      switchMap((tecnico) =>
        this.auth.login({ username: v.email ?? '', password: v.clave ?? '' }).pipe(
          map(() => (tecnico as { uuid: string }).uuid)
        )
      ),
      switchMap((uuidTecnico) => {
        const subidas = [
          ...certificaciones.map(c => this.servicioCertificacion.crear(uuidTecnico, c)),
          ...portfolios.map(p => this.servicioPortfolio.crear(uuidTecnico, p)),
        ];
        // forkJoin([]) termina sin emitir, asi que sin documentos se devuelve el uuid directo
        return subidas.length > 0 ? forkJoin(subidas).pipe(map(() => uuidTecnico)) : of(uuidTecnico);
      })
    ).subscribe({
      next: (uuidTecnico) => {
        this.enviado = false;
        // la sesion queda iniciada: se va directo al perfil del tecnico (cambiar por '/' si se prefiere el inicio)
        this.router.navigate(['/perfil-tecnico', uuidTecnico]);
      },
      error: (e) => {
        this.enviado = false;
        console.error('Error al registrar técnico', e);

        if (!this.cuentaCreada) {
          // fallo el registro: no se creo nada, se puede corregir y reintentar
          this.errorServidor = e?.error?.mensaje ?? 'No se pudo completar el registro.';
          return;
        }

        // la cuenta ya existe: no se puede reintentar el registro, se avisa y se deja ir al login
        this.avisoDocumentacion = 'Tu cuenta se creó, pero no pudimos terminar de configurarla (inicio de sesión o documentación). Iniciá sesión y cargá la documentación desde tu perfil.';
      },
    });
  }

  irALogin(): void {
    this.router.navigate(['/iniciar-sesion']);
  }

  // valida solo el documento del paso actual.
  // obligatorio: tiene que estar completo y válido. Opcional: vacío vale, a medias no.
  private validarPasoDocumentacion(): boolean {
    const paso = this.pasoDocumentacionActual;
    if (!paso) return true;

    const indice = this.indiceEnSuTipo(this.paso - 4);
    let ok: boolean;

    if (paso.tipo === 'certificacion') {
      const form = this.certificaciones.get(indice);
      if (paso.obligatorio) {
        form?.formulario.markAllAsTouched();
        ok = !!form?.datos();
      } else {
        ok = form?.validar() ?? true;
      }
    } else {
      const form = this.portfolios.get(indice);
      if (paso.obligatorio) {
        form?.form.markAllAsTouched();
        ok = !!form?.datos();
      } else {
        ok = form?.validar() ?? true;
      }
    }

    this.errorDocumentacion = ok
      ? null
      : paso.obligatorio
        ? `Completá la documentación obligatoria para ${paso.especialidad?.nombre}.`
        : 'Revisá los datos del documento que empezaste a cargar.';

    return ok;
  }

}