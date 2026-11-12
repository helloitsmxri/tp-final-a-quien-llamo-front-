import { Injectable } from '@angular/core';
import { GOOGLE_MAPS_API_KEY } from '../../config/google-maps.config';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoader {
  private carga?: Promise<void>;

  // Para saber si está lista la función de importLibrary de Google Maps
  private estaLista(): boolean {
    return typeof (window as any).google?.maps?.importLibrary === 'function';
  }

  // Espera (hasta 10 segundos) a que importLibrary esté disponible
  private esperarApi(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const inicio = Date.now();

      const revisar = () => {
        if (this.estaLista()) {
          resolve();
        } else if (Date.now() - inicio > 10000) {
          reject(new Error('Google Maps se descargó pero no terminó de iniciarse'));
        } else {
          setTimeout(revisar, 50);
        }
      };

      revisar();
    });
  }

  // Carga el script de Google Maps la primera vez y reutiliza la misma carga después
  cargar(): Promise<void> {
    if (this.estaLista()) return Promise.resolve();
    if (this.carga) return this.carga;

    this.carga = new Promise<void>((resolve, reject) => {
      // Google llama a esta función si rechaza la clave
      (window as any).gm_authFailure = () =>
        console.error('Google Maps rechazó la API key (revisá restricciones, API habilitada y facturación)');

      const script = document.createElement('script');
      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}` +
        `&v=weekly&loading=async&language=es&region=AR`;
      script.async = true;

      // El script se descargó: esperamos a que la API termine de iniciarse
      script.onload = () => {
        this.esperarApi().then(resolve, (err) => {
          this.carga = undefined;
          reject(err);
        });
      };

      script.onerror = () => {
        this.carga = undefined;
        reject(new Error('No se pudo cargar Google Maps'));
      };

      document.head.appendChild(script);
    });

    return this.carga;
  }
}