import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculoService {

  constructor() { }

  sumarPorColumnas(datos: any[]): { [key: string]: number } {
    const sumas: { [key: string]: number } = {};

    datos.forEach(item => {
      Object.keys(item).forEach(key => {
        const valor = item[key];

        if (typeof valor === 'number') {
          if (!sumas[key]) {
            sumas[key] = 0;  // Inicializar la suma para esta columna si es la primera vez que se ve
          }

          sumas[key] += valor;  // Sumar el valor a la suma acumulada de esta columna
        }
      });
    });
    Object.keys(sumas).forEach(key => {
      sumas[key] = parseFloat(sumas[key].toFixed(2));
    });

    return sumas;  // Devolver un objeto con la suma de cada columna
  }

  buscarEnLaLista<T>(list: T[], key: keyof T, value: any): T | undefined {
    return list.find(item => item[key] === value);
  }

}
