import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';
import { ListaChat } from './chat/pages/lista-chat/lista-chat';
import { Planes } from './planes/planes';
import { ChatView } from './chat/pages/chat-view/chat-view';
import { DetalleUbicacion } from './ubicacion/pages/detalle-ubicacion/detalle-ubicacion';
import { FormPago } from './pago/pages/form-pago/form-pago';
import { ListPago } from './pago/pages/list-pago/list-pago';
import { DetallePago } from './pago/pages/detalle-pago/detalle-pago';
import {FormularioRegistro} from './tecnico/pages/formulario-registro/formulario-registro';
import { PerfilTecnico } from './tecnico/pages/perfil-tecnico/perfil-tecnico';
import { Proyecto } from './proyecto/proyecto';
import { authGuard } from './auth/guards/authGuard';
import { PerfilEdicion } from './user/pages/perfil-edicion/perfil-edicion';
import { Perfil } from './user/pages/perfil/perfil';
import { MisPresupuestos } from './presupuesto/pages/mis-presupuestos/mis-presupuestos';
import { EditarTecnico } from './tecnico/pages/editar-tecnico/editar-tecnico';
import { CertificacionList } from './certificacion/pages/certificacion-list/certificacion-list';
import { PortfolioList } from './portfolio/pages/portfolio-list/portfolio-list';
import { EditarPortfolio } from './portfolio/pages/editar-portfolio/editar-portfolio';
import { EditarCertificacion } from './certificacion/pages/editar-certificacion/editar-certificacion';
import { PerfilTecnicoPublico } from './tecnico/pages/perfil-tecnico-publico/perfil-tecnico-publico';
import { ListTecnicos } from './tecnico/pages/list-tecnicos/list-tecnicos';
import { MisDenuncias } from './denuncia/pages/mis-denuncias/mis-denuncias';
import { RecuperarPassword } from './auth/recuperar-password/recuperar-password';
import { ResetPassword } from './auth/reset-password/reset-password';
import { ListTrabajo } from './trabajo/pages/list-trabajo/list-trabajo';
import { DetalleTrabajo } from './trabajo/pages/detalle-trabajo/detalle-trabajo';
import { FormTrabajo } from './trabajo/pages/form-trabajo/form-trabajo';
import { AdministradorDenuncias } from './admin/pages/administrador-denuncias/administrador-denuncias';
import { PanelAdmin } from './admin/pages/panel-admin/panel-admin';
import { ListRating } from './rating/pages/list-rating/list-rating';
import { FormRating } from './rating/pages/form-rating/form-rating';
import { Contacto } from './contacto/contacto';
import { outForm } from './auth/guards/out-form';

export const routes: Routes = [

    // HOME (PÚBLICO)
    {path: '', component: Home},
    {path: 'home', component: Home},

    // REGISTRO (PÚBLICO)
    {path: 'planes', component: Planes},
    {path: 'registro-tecnico', component: FormularioRegistro},
    {path: 'register', component: Register},

    // PERFILES (AUTHGUARD)
    // TÉCNICO
    {path: 'perfil-tecnico/:uuid', component: PerfilTecnicoPublico},
    {path: 'perfil-tecnico/:uuid/proyectos', component: Proyecto, canActivate: [authGuard]},
    {path: 'mi-perfil-tecnico', component: PerfilTecnico, canActivate: [authGuard]},
    {path: 'mi-perfil-tecnico/editar', component: EditarTecnico, canActivate: [authGuard]},
    {path: 'tecnicos', component: ListTecnicos},
     //certificacion
    {path: 'mis-certificaciones', component: CertificacionList, canActivate: [authGuard]},
    {path: 'mis-certificaciones/editar/:uuid', component: EditarCertificacion, canActivate: [authGuard]},
    
    {path: 'mis-portfolios', component: PortfolioList, canActivate: [authGuard]},
    {path: 'mis-portfolios/editar/:uuid', component: EditarPortfolio, canActivate: [authGuard]},

    // mis denuncias
    {path : 'mis-denuncias', component: MisDenuncias, canActivate : [authGuard]},

    // administracion
    {path: 'panel-admin', component: PanelAdmin, canActivate: [authGuard], children: [
    {path: '', redirectTo: 'denuncias', pathMatch: 'full'},
    {path: 'denuncias', component: AdministradorDenuncias}]
    },
    
    // USUARIO
    {path: 'perfil-edicion', component: PerfilEdicion, canActivate: [authGuard]},
    {path: 'mi-perfil', component: Perfil, canActivate: [authGuard]},
    
    // CUALQUIER PERFIL SELECCIONADO
    {path: 'perfil/:uuid', component: Perfil, canActivate: [authGuard]},
    
    // CHATS
    {path: 'chats', component: ChatView },
    {path: '', redirectTo: 'chats', pathMatch: 'full' },
    {path:'ubicacion', component:DetalleUbicacion },

    // PRESUPUESTOS
    {path: 'mis-presupuestos', component: MisPresupuestos, canActivate: [authGuard]},

    // PAGOS
    {path: 'pagos', component: FormPago,canActivate: [authGuard]},//los guard entre ellos no se choquen porque no entran 
    {path: 'pagos/lista', component: ListPago },
    {path: 'pagos/:uuid', component: DetallePago },
    {path: 'pagos/metodo/:metodoPago', component: ListPago },
    {path: 'pagos/estado/:estado', component: ListPago },
    {path: 'pagos/cliente/:uuid', component: ListPago },
    {path: 'pagos/tecnico/:uuid', component: ListPago },
    {path: 'pagos/mercado-pago/:orderId', component: DetallePago },

    // INICIO DE SESIÓN (PÚBLICO)

    {path: 'iniciar-sesion', component: Login},
    { path: 'recuperar', component: RecuperarPassword },
    { path: 'reset-password', component: ResetPassword },

// Reseñas del usuario logueado (enlace desde el header / perfil)
  {path: 'mis-resenas',component: ListRating,canActivate: [authGuard],},
  // Crear nueva reseña (botón "★ Crear reseña" en ListRating)
  {path: 'ratings/nuevo',component: FormRating,canActivate: [authGuard],},
  // Ver reseñas públicas de un usuario/técnico específico por su UUID
  {path: 'ratings/:uuid',component: ListRating,},
    { path: 'contacto', component: Contacto },

    // TRABAJOS
{path: 'trabajos/:uuid', component: FormTrabajo, canActivate: [authGuard],canDeactivate: [outForm]},
{path: 'trabajos/lista', component: ListTrabajo, canActivate: [authGuard]},
{path: 'mis-trabajos', component: ListTrabajo, canActivate: [authGuard]},
{path: 'trabajos/:uuid', component: DetalleTrabajo, canActivate: [authGuard]},
{path: 'trabajos/estado/:estadoTrabajo', component: ListTrabajo, canActivate: [authGuard]},
{path: 'trabajos/cliente/:uuid', component: ListTrabajo, canActivate: [authGuard]},
{path: 'trabajos/tecnico/:uuid', component: ListTrabajo, canActivate: [authGuard]},
  
  
];
