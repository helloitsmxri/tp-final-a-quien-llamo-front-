import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Register } from './user/pages/register/register';
import { Login } from './user/pages/login/login';
import { DetalleMensaje } from './mensaje/pages/detalle-mensaje/detalle-mensaje';
import { ListaChat } from './chat/pages/lista-chat/lista-chat';
import { Planes } from './planes/planes';
import { ChatView } from './chat/pages/chat-view/chat-view';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'register', component: Register},
    {path: 'iniciar-sesion', component: Login},
    {path: 'planes', component: Planes},

    //Nota: paths para probar
    {path: 'chats', component: ChatView },
    {path: '', redirectTo: 'chats', pathMatch: 'full' }
];
