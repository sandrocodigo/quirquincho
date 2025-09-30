import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {
  
  latitud: string = 'Obteniendo...';
  longitud: string = 'Obteniendo...';
  direccionExacta: string = 'Obteniendo dirección...';

  private cargandoSubject = new BehaviorSubject<boolean>(false);
  cargando$ = this.cargandoSubject.asObservable(); // Observable para el estado de carga

  constructor() {}

  obtenerUbicacionActual(): Promise<void> {
    this.cargandoSubject.next(true); // Activar estado de carga

    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.latitud = position.coords.latitude.toFixed(6); // Limitar a 6 decimales
            this.longitud = position.coords.longitude.toFixed(6);
            this.obtenerDireccionExacta()
              .then(() => {
                resolve(); // Resolver cuando se obtiene la dirección
                this.cargandoSubject.next(false); // Desactivar estado de carga
              })
              .catch((error) => {
                reject(error); // Propagar el error si ocurre en obtenerDireccionExacta
                this.cargandoSubject.next(false); // Desactivar estado de carga
              });
          },
          (error) => {
            console.error('Error al obtener la ubicación:', error.message);
            this.latitud = 'Error';
            this.longitud = 'Error';
            this.cargandoSubject.next(false); // Desactivar estado de carga
            reject(error); // Rechazar la promesa
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        console.error('La geolocalización no está soportada por este navegador.');
        this.latitud = 'No soportada';
        this.longitud = 'No soportada';
        this.cargandoSubject.next(false); // Desactivar estado de carga
        reject('La geolocalización no está soportada por este navegador.');
      }
    });
  }

  obtenerDireccionExacta(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${this.latitud}&lon=${this.longitud}&format=json&accept-language=es`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.address) {
            this.direccionExacta = `${data.address.road || 'Sin calle'}, ${data.address.city || data.address.town || data.address.village || 'Sin ciudad'}, ${data.address.country}`;
            resolve(); // Resolver cuando se obtiene la dirección
          } else {
            this.direccionExacta = 'No se encontró dirección.';
            reject('No se encontró dirección para estas coordenadas.');
          }
        })
        .catch((error) => {
          console.error('Error al obtener la dirección:', error);
          this.direccionExacta = 'Error al obtener dirección.';
          reject(error); // Rechazar la promesa si ocurre un error
        });
    });
  }
}
