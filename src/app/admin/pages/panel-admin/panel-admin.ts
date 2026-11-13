import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-panel-admin',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.css',
})
export class PanelAdmin {

}
