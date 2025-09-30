import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore, collection, addDoc, doc, getDoc, updateDoc, onSnapshot, deleteDoc, collectionData, orderBy, query, CollectionReference, where, limit, getDocs, startAt, endAt,
} from '@angular/fire/firestore';
import { Tarifa } from '../modelos/tarifa';




@Injectable({
  providedIn: 'root'
})
export class TarifaService {

  private url = 'tarifas';

  constructor(private firestore: Firestore) { }

  // CREAR
  async crear(datos: any) {
    if (datos.hasOwnProperty('precio1')) { datos.precio1 = parseFloat(datos.precio1); }
    if (datos.hasOwnProperty('precio2')) { datos.precio2 = parseFloat(datos.precio2); }
    if (datos.hasOwnProperty('precio3')) { datos.precio3 = parseFloat(datos.precio3); }
    if (datos.hasOwnProperty('precio4')) { datos.precio4 = parseFloat(datos.precio4); }
    if (datos.hasOwnProperty('precio5')) { datos.precio5 = parseFloat(datos.precio5); }

    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    return docRef;
  }

  // EDITAR
  async editar(ID: any, datos: any) {
    if (datos.hasOwnProperty('precio1')) { datos.precio1 = parseFloat(datos.precio1); }
    if (datos.hasOwnProperty('precio2')) { datos.precio2 = parseFloat(datos.precio2); }
    if (datos.hasOwnProperty('precio3')) { datos.precio3 = parseFloat(datos.precio3); }
    if (datos.hasOwnProperty('precio4')) { datos.precio4 = parseFloat(datos.precio4); }
    if (datos.hasOwnProperty('precio5')) { datos.precio5 = parseFloat(datos.precio5); }

    const documento = doc(this.firestore, `${this.url}`, ID);
    await updateDoc(documento, datos);
  }

  async obtenerPorId(ID: any): Promise<any> {
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
  obtenerTodosTR() {
    return collectionData<Tarifa>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<Tarifa>,
        orderBy('numero')
      ), { idField: 'id' }
    );
  }

  // OBTENER TODOS
  async obtenerTodos(): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      orderBy('numero')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  // OBTENER POR FECHA Y TURNO
  async obtenerPorFechaYTurnoYUsuario(fecha: any, turno: any, usuario: any): Promise<Tarifa[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Tarifa>,
      where('fecha', '==', fecha),
      where('turno', '==', turno),
      where('usuario', '==', usuario),
      orderBy('fechaRegistro', 'asc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: Tarifa[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as Tarifa);
      });
      return registros;
    });
  }

  // OBTENER POR EMPRESA
  async obtenerPorEmpresa(empresa: any): Promise<Tarifa[]> {
    console.log(empresa);
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Tarifa>,
      where('empresa', '==', empresa),
      orderBy('placa', 'asc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: Tarifa[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as Tarifa);
      });
      return registros;
    });
  }

  async obtenerPorUsuario(usuarioId: any): Promise<Tarifa | null> {
    // Construir la consulta
    const q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Tarifa>,
      where('conductorEmail', '==', usuarioId)
    );

    // Ejecutar la consulta y obtener el primer documento
    return getDocs(q).then((querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]; // Obtener el primer documento
        return { ...doc.data(), id: doc.id } as Tarifa;
      }
      return null; // Si no hay documentos que coincidan
    });
  }


  // OBTENER POR EMPRESA Y PLACA
  async obtenerPorEmpresaYPlaca(empresa: any, placa: any): Promise<Tarifa[]> {
    console.log(empresa);
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Tarifa>,
      where('empresa', '==', empresa),
      where('placa', '==', placa)
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: Tarifa[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as Tarifa);
      });
      return registros;
    });
  }

  async obtenerPorPlaca(placa: any): Promise<Tarifa | null> {
    const placas = placa.toUpperCase();
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Tarifa>,
      where('placa', '==', placas)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    } else {
      const doc = querySnapshot.docs[0];
      return { ...doc.data(), id: doc.id } as Tarifa;
    }
  }



  // ELIMINAR
  async eliminar(ID: any) {
    const documento = doc(this.firestore, `${this.url}`, ID);
    await deleteDoc(documento);
  }

  // CONSULTA
  obtenerConsultaTR(datos: any) {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;

    // Inicializamos con la condición aprobado=true
    const condiciones = [where('activo', '==', true)];

    if (datos.empresa !== 'TODOS') {
      condiciones.push(where('empresa', '==', datos.empresa));
    }

    // Si hay condiciones adicionales, actualizamos la consulta
    let q;
    if (condiciones.length > 0) {
      q = query(
        coleccion,
        ...condiciones,
        orderBy('empresa', 'asc'),
      );
    } else {
      q = query(
        coleccion,
        orderBy('empresa', 'asc'),
        where('activo', '==', true)  // Se asegura de que la condición de aprobado siempre esté presente
      );
    }

    return collectionData<any>(q, { idField: 'id' });
  }


  async obtenerConsulta(datos: any): Promise<Tarifa[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Tarifa>;
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
      orderBy('fechaRegistro'),
    ];


    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango, limit(datos.limite));

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }

  async obtenerConsultaPorTipo(datos: any): Promise<Tarifa[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Tarifa>;
    // let condiciones = [where('activo', '==', true)];
    let condiciones = [];

    // Aplicar condiciones 
    if (datos.adminTipo !== 'TODOS') {
      condiciones.push(where('adminTipo', '==', datos.adminTipo));
    }

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
