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

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'register', component: Register},
    {path: 'iniciar-sesion', component: Login},
    {path: 'planes', component: Planes},
    {path: 'registro-tecnico', component: FormularioRegistro},

    //Nota: paths para probar
    {path: 'chats', component: ChatView },
    {path: '', redirectTo: 'chats', pathMatch: 'full' },
    {path:'ubicacion', component:DetalleUbicacion },


    {path: 'pagos', component: FormPago },
    {path: 'pagos/lista', component: ListPago },
    {path: 'pagos/:uuid', component: DetallePago },
    {path: 'pagos/metodo/:metodoPago', component: ListPago },
    {path: 'pagos/estado/:estado', component: ListPago },
    {path: 'pagos/cliente/:uuid', component: ListPago },
    {path: 'pagos/tecnico/:uuid', component: ListPago },
    {path: 'pagos/mercado-pago/:orderId', component: DetallePago },



    //RUTAS PUBLICAS
];
