import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Register } from './user/pages/register/register';
import { Login } from './user/pages/login/login';
import { DetalleMensaje } from './mensaje/pages/detalle-mensaje/detalle-mensaje';
import { ListaChat } from './chat/pages/lista-chat/lista-chat';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'register', component: Register},
    {path: 'iniciar-sesion', component: Login},
    /* Nota: estos path los hice para probar el funcionamiento, luego se borran */
    {path:'detalle-mensaje', component:DetalleMensaje},
    {path:'chats', component:ListaChat},
    {path:'mensajes/:uuidChat', component:DetalleMensaje}
];
