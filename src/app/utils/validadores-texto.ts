import { AbstractControl, ValidationErrors } from '@angular/forms';

//solo letras (con tildes, ñ), permite espacios, apostrofe y guion entre palabras
export function soloLetras(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '').trim();
  if (!v) return null; // el required se encarga de lo vacío
  return /^\p{L}+(?:[ '’-]\p{L}+)*$/u.test(v) ? null : { soloLetras: true };
}

//texto libre, pero que tenga al menos una letra (rechaza "2222", "!!!", etc.)
export function contieneLetras(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '').trim();
  if (!v){
    return null;
  } 
  return /\p{L}/u.test(v) ? null : { sinLetras: true };
}

//mayor de 18 (el valor viene como yyyy-MM-dd)
export function validarEdad(control: AbstractControl): ValidationErrors | null {
  if (!control.value){
    return null;
  } 
  const [anio, mes, dia] = String(control.value).split('-').map(Number);
  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)){
    edad--;
  } 
  return edad >= 18 ? null : { menorDeEdad: true };
}

export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FOTO_MB = 5;

// num de matricula: letras, numeros y separadores (. - / espacio), con al menos un numero.
// Acepta "MP 1234", "12345/A", "M-2045"; rechaza "wdwasd" o "###".
export function matriculaValida(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '').trim();
  if (!v){
    return null;
  } 
  const caracteresOk = /^[\p{L}\d][\p{L}\d .\/-]*$/u.test(v);
  return caracteresOk && /\d/.test(v) ? null : { matricula: true };
}