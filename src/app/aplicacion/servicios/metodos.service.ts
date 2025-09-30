import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MetodosService {

  constructor() { }

  buscarUnoEnLista<T>(list: T[], key: keyof T, value: any): T | undefined {
    return list.find(item => item[key] === value);
  }

  buscarMuchosEnLista<T>(list: T[], key: keyof T, value: any): T[] {
    return list.filter(item => item[key] === value);
  }

  buscarEnJson(jsonData: any[], searchTerm: string): any[] {
    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    return jsonData.filter(item =>
      Object.values(item).some(value =>
        (value ?? '').toString().toLowerCase().includes(lowerSearchTerm)
      )
    );
  }

}
