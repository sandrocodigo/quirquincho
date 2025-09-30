import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference, limit } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ArqueoService {

  private url = 'arqueos';

  constructor(private firestore: Firestore) { }

  // CREAR
  async crear(datos: any) {
    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    return docRef;
  }

  // EDITAR
  async editar(ID: any, datos: any) {
    const documento = doc(this.firestore, `${this.url}`, ID);
    await updateDoc(documento, datos);
  }

  // OBTENER POR ID
  async obtenerPorId(ID: any): Promise<any | null> {
    const docRef = doc(this.firestore, `${this.url}`, ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as any;
    } else {
      return null;
    }
  }

  // ONTENER POR ID EN TIEMPO REAL
  obtenerPorIdTR(ID: any) {
    const docRef = doc(this.firestore, `${this.url}`, ID);
    return new Observable((subscriber) => {
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          subscriber.next(docSnap.data());
        } else {
          subscriber.next(null);
        }
      });
      return unsubscribe;
    });
  }

  // OBTENER TODOS
  async obtenerTodos(): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      orderBy('codigo', 'desc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  // OBTENER TODOS EN TIEMPO REAL
  obtenerTodosTR() {
    return collectionData<any>(
      query<any, any>(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        // orderBy('ordenar')
      ), { idField: 'id' }
    );
  }

  // OBTENER CONSULTA
  async obtenerConsulta(datos: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      orderBy('codigo', 'desc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  // OBTENER ULTIMO FINAL
  obtenerUltimoFinal(sucursal: any) {
    return collectionData<any>(
      query<any, any>(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        where('sucursal', '==', sucursal),
        orderBy('codigo', 'desc')
      ), { idField: 'id' }
    );
  }

  // FINALIZAR Y CREA UNO NUEVO
  async generar() {
    let ultimoRegistroFinal;
    let ultimoRegistroPrecio;

    // Obtener el último registro para obtener el valor final
    const ultimoFinalObservable = this.obtenerUltimoFinal('SUCURSAL_1');
    const ultimoFinal: any[] = await firstValueFrom(ultimoFinalObservable);
    if (ultimoFinal && ultimoFinal.length > 0) {
      // console.log('VALOR: ', ultimoFinal);
      ultimoRegistroFinal = parseFloat(ultimoFinal[0].final);
    }



    // Crear el registro
    const registro = {
      inicio: ultimoRegistroFinal,
      final: 0,
      litros: 0,
      precio: ultimoRegistroPrecio,
      dinero: 0,
      fechaRegistro: new Date(), // Fecha actual
      activo: true,
      finalizado: false,
      aprobado: false,

      edicion: true
      // Aquí puedes agregar cualquier otro campo necesario para tu registro
    };

    await addDoc(collection(this.firestore, `${this.url}`), registro);
  }
}
