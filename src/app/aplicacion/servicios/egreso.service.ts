import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference, limit, deleteDoc, startAt, endAt } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class EgresoService {

  private url = 'egresos';

  constructor(private firestore: Firestore) { }

  // CREAR
  async crear(datos: any) {
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

    // Retornar el documento con su ID y los datos
    return { id: docRef.id, ...datos };
  }

  // EDITAR
  async editar(ID: any, datos: any) {
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
  async obtenerConsulta(datos: any): Promise<any[]> {
    console.log(datos);
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    let condiciones = [];

    if (datos.sucursal !== 'TODOS') {
      condiciones.push(where('sucursal', '==', datos.sucursal));
    }

    // Verificación del campo finalizado
    if (datos.finalizado !== 'TODOS') {
      const valorBoolean = datos.finalizado === 'true';
      condiciones.push(where('finalizado', '==', valorBoolean));
    }

    // Orden y rango de fechas
    let ordenYRango = [
      orderBy('fecha', 'asc'),
      orderBy('codigo', 'desc'),
      startAt(datos.fechaInicio),
      endAt(datos.fechaFinal)
    ];

    // Crear la consulta combinada
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }

  // OBTENER VENTAS POR PAGAR
  async obtenerVentasPorPagar(datos: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('tipo', '==', 'VENTA'),
      where('finalizado', '==', true),
      where('pagado', '==', false),
      //orderBy('ordenar')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  // OBTENER VENTAS POR PAGAREN TIEMPO REAL
  obtenerVentasPorPagarTR() {
    return collectionData<any>(
      query<any, any>(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        where('tipo', '==', 'VENTA'),
        where('finilizado', '==', true),
      ), { idField: 'id' }
    );
  }

  // ELIMINAR
  async eliminar(ID: any) {
    const documento = doc(this.firestore, `${this.url}`, ID);
    await deleteDoc(documento);
  }


  // OBTENER POR ID DE ORDEN
  async obtenerPorOrdenId(ordenId: any): Promise<any[]> {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    let condiciones = [
      where('ordenId', '==', ordenId),
    ];

    // Crear la consulta combinada
    let q = query(coleccion, ...condiciones);

    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }

  // OBTENER POR CODIGO DE ORDEN
  async obtenerPorOrdenCodigo(ordenCodigo: any): Promise<any[]> {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    let condiciones = [
      where('ordenCodigo', '==', ordenCodigo),
    ];

    // Crear la consulta combinada
    let q = query(coleccion, ...condiciones);

    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }


  // OBTENER EGRESOS POR TRASPASO
  async obtenerEgresosPorTraspasoPendientes(sucursalDestino: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('tipo', '==', 'TRASPASO'),
      where('finalizado', '==', true),
      where('traspasado', '==', false),
      where('sucursalDestino', '==', sucursalDestino),
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

}
