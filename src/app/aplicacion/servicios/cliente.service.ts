import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference, limit } from '@angular/fire/firestore';
import { Cliente } from '../modelos/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private url = 'clientes';

  constructor(private firestore: Firestore) { }

  // CREAR
  async crear(datos: any) {
    if (datos.hasOwnProperty('numero')) { datos.numero = parseFloat(datos.numero); }
    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    return docRef;
  }

  // EDITAR
  async editar(ID: any, datos: any) {
    if (datos.hasOwnProperty('numero')) { datos.numero = parseFloat(datos.numero); }
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
      orderBy('empresa')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }


  // OBTENER CONSULTA
  async obtenerConsulta(datos: any): Promise<Cliente[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Cliente>;
    // let condiciones = [where('activo', '==', true)];
    let condiciones = [];

    // Aplicar condiciones 
    /*     if (datos.activo !== 'TODOS') {
          condiciones.push(where('cliente', '==', datos.cliente));
        }  */

    if (datos.activo !== 'TODOS') {
      const activoBoolean = datos.activo === 'true'; // Asegúrate de que sea booleano
      condiciones.push(where('activo', '==', activoBoolean));
    }


    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('numero', 'desc'),
    ];


    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango, limit(datos.limite));

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }


  // OBTENER TODOS EN TIEMPO REAL
  obtenerTodosTR() {
    return collectionData<any>(
      query<any, any>(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        orderBy('ordenar')
      ), { idField: 'id' }
    );
  }

  async obtenerUltimo(): Promise<any> {
    const coleccionRef = collection(this.firestore, `${this.url}`) as CollectionReference<any>;

    const q = query(
      coleccionRef,
      orderBy('numero', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    // Devuelve el primer documento si existe
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data(); // Retorna los datos del documento
    } else {
      return null; // O maneja el caso cuando no se encuentra ningún documento
    }
  }
}
