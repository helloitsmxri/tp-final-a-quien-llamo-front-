import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Register } from './user/pages/register/register';
import { Login } from './user/pages/login/login';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'register', component: Register},
    {path: 'iniciar-sesion', component: Login}
];
