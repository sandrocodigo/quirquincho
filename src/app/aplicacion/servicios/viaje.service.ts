import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference, limit, deleteDoc, startAt, endAt } from '@angular/fire/firestore';
import { Viaje } from '../modelos/viaje';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViajeService {

  private url = 'viajes';

  constructor(private firestore: Firestore) { }

  // CREAR
  async crear(datos: any) {
    if (datos.hasOwnProperty('precio')) { datos.precio = parseFloat(datos.precio); }
    if (datos.hasOwnProperty('itbms')) { datos.itbms = parseFloat(datos.itbms); }
    if (datos.hasOwnProperty('total')) { datos.total = parseFloat(datos.total); }
    if (datos.hasOwnProperty('totalGeneral')) { datos.totalGeneral = parseFloat(datos.totalGeneral); }
    if (datos.hasOwnProperty('porcentajeDescuento')) { datos.porcentajeDescuento = parseFloat(datos.porcentajeDescuento); }
    if (datos.hasOwnProperty('porcentajeImpuesto')) { datos.porcentajeImpuesto = parseFloat(datos.porcentajeImpuesto); }

    // Buscar el código más grande en la colección
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      orderBy('codigo', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    let nuevoCodigo = 1; // Código por defecto en caso de que no haya registros

    querySnapshot.forEach((doc) => {
      if (doc.data().codigo >= nuevoCodigo) {
        nuevoCodigo = doc.data().codigo + 1; // Incrementar el código más grande
      }
    });

    // Usar el nuevo código para el nuevo registro
    datos.codigo = nuevoCodigo;

    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    return docRef;
  }

  // EDITAR
  async editar(ID: any, datos: any) {

    if (datos.hasOwnProperty('precio')) { datos.precio = parseFloat(datos.precio); }
    if (datos.hasOwnProperty('itbms')) { datos.itbms = parseFloat(datos.itbms); }
    if (datos.hasOwnProperty('total')) { datos.total = parseFloat(datos.total); }
    if (datos.hasOwnProperty('totalGeneral')) { datos.totalGeneral = parseFloat(datos.totalGeneral); }
    if (datos.hasOwnProperty('porcentajeDescuento')) { datos.porcentajeDescuento = parseFloat(datos.porcentajeDescuento); }
    if (datos.hasOwnProperty('porcentajeImpuesto')) { datos.porcentajeImpuesto = parseFloat(datos.porcentajeImpuesto); }

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
      orderBy('codigo')
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
        orderBy('ordenar')
      ), { idField: 'id' }
    );
  }

  // OBTENER CONSULTA
  async obtenerConsulta(datos: any): Promise<Viaje[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Viaje>;
    let condiciones = [
      where('sucursal', '==', datos.sucursal),
      where('activo', '==', true)
    ];

    // Aplicar condiciones solo si el usuario y el producto no son 'TODOS'
    if (datos.cliente !== 'TODOS') {
      condiciones.push(where('clienteId', '==', datos.cliente));
    }

    if (datos.vehiculo !== 'TODOS') {
      condiciones.push(where('vehiculoId', '==', datos.vehiculo));
    }

    // Verificación del campo finalizado
    if (datos.finalizado !== 'TODOS') {
      const valorBoolean = datos.finalizado === 'true';
      condiciones.push(where('finalizado', '==', valorBoolean));
    }

    // Verificación del campo procesado a venta
    if (datos.procesado !== 'TODOS') {
      const procesadoBoolean = datos.procesado === 'true'; // Asegúrate de que sea booleano
      condiciones.push(where('procesado', '==', procesadoBoolean));
    }

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('fecha', 'asc'),
      // orderBy('codigo', 'desc'),
      startAt(datos.fechaInicio),
      endAt(datos.fechaFinal)
    ];

    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }


  // OBTENER CONSULTA
  async obtenerPorConductor(datos: any): Promise<Viaje[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Viaje>;
    let condiciones = [
      where('conductorEmail', '==', datos.conductorEmail),
      where('finalizado', '==', datos.finalizado),
      where('activo', '==', true)
    ];

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('fecha', 'desc'),
    ];

    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }


  // ELIMINAR
  async eliminar(ID: any) {
    const documento = doc(this.firestore, `${this.url}`, ID);
    await deleteDoc(documento);
  }

}
