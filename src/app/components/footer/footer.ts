import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
/*más adelante añadiré cositas de suscribirse al newsletter*/  

mensajes = [
  '20% off pagando con Mercado Pago',
  '3 cuotas sin interés con tarjeta',
  'Hacé clic acá para más información sobre las promociones vigentes'
];
copias = [0, 1, 2, 3];
}
