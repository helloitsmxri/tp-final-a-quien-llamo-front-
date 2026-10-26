import { Component, inject, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/user';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {

  usuarioPerfilService = inject(UsuarioService);

  
}
