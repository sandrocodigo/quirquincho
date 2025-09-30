import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TituloService {

  constructor() { }

  convertir(title: string): string {
    // Validación: Si title es null o undefined, devolver cadena vacía
    if (!title) {
      return '';
    }

    const map: { [key: string]: string } = {
      '-': '_',
      'a': 'á|à|ã|â|À|Á|Ã|Â',
      'e': 'é|è|ê|É|È|Ê',
      'i': 'í|ì|î|Í|Ì|Î',
      'o': 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
      'u': 'ú|ù|û|ü|Ú|Ù|Û|Ü',
      'c': 'ç|Ç',
      'n': 'ñ|Ñ'
    };

    for (const pattern in map) {
      title = title.replace(new RegExp(map[pattern], 'g'), pattern);
    }

    return title
      .toLowerCase() // Convertir a minúsculas
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/[^a-z0-9\-]/g, '') // Eliminar caracteres que no sean alfanuméricos o guiones
      .replace(/\-\-+/g, '-'); // Reemplazar múltiples guiones por uno solo
  }

}
