import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';
import { DetalleMensaje } from './mensaje/pages/detalle-mensaje/detalle-mensaje';
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
    {path: 'perfil-tecnico/:uuid', component: PerfilTecnico, canActivate: [authGuard]},
    {path: 'perfil-tecnico/:uuid/proyectos', component: Proyecto, canActivate: [authGuard]},
    {path: 'mi-perfil-tecnico', component: PerfilTecnico, canActivate: [authGuard]},
    {path: 'mi-perfil-tecnico/editar', component: EditarTecnico, canActivate: [authGuard]},
     //certificacion
    {path: 'mis-certificaciones', component: CertificacionList, canActivate: [authGuard]},
    {path: 'mis-certificaciones/editar/:uuid', component: EditarCertificacion, canActivate: [authGuard]},
    
    {path: 'mis-portfolios', component: PortfolioList, canActivate: [authGuard]},
    {path: 'mis-portfolios/editar/:uuid', component: EditarPortfolio, canActivate: [authGuard]},
    
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
];
