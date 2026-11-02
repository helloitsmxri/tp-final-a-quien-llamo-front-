import { AbstractControl, ValidationErrors } from '@angular/forms';

export const TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];

// Spring Boot limita cada archivo a 1 MB por defecto (spring.servlet.multipart.max-file-size).
// Si el back lo sube, cambiá este número.
export const MAX_MB = 1;

export function archivoValido(control: AbstractControl): ValidationErrors | null {
  const archivo = control.value as File | null;
  if (!archivo) return null; // la obligatoriedad la maneja Validators.required
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) return { tipoInvalido: true };
  if (archivo.size > MAX_MB * 1024 * 1024) return { tamanioExcedido: true };
  return null;
}

// <input type="date"> entrega yyyy-MM-dd, así que se puede comparar como texto
export function fechaFutura(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string;
  if (!valor) return null;
  const h = new Date();
  const hoy = `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
  return valor > hoy ? null : { fechaPasada: true };
}

// A nivel grupo: el portfolio necesita un link, un archivo, o los dos
export function enlaceOArchivo(grupo: AbstractControl): ValidationErrors | null {
  const enlace = (grupo.get('enlaceExterno')?.value as string | null)?.trim();
  const archivo = grupo.get('archivo')?.value as File | null;
  return enlace || archivo ? null : { faltaEnlaceOArchivo: true };
}

// El back recibe el archivo del portfolio como byte[] dentro de un JSON => base64 sin el prefijo "data:..."
export function archivoABase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve((lector.result as string).split(',')[1]);
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(archivo);
  });
}