import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference, deleteDoc, limit, startAt, endAt } from '@angular/fire/firestore';
import { EgresoDetalle } from '../modelos/egreso-detalle';

@Injectable({
  providedIn: 'root'
})
export class EgresoDetalleService {

  private url = 'egresos-detalles';

  constructor(private firestore: Firestore) { }

  // CREAR
  async crear(datos: any) {
    if (datos.hasOwnProperty('cantidad')) { datos.cantidad = parseFloat(datos.cantidad); }
    if (datos.hasOwnProperty('pc')) { datos.pc = parseFloat(datos.pc); }
    if (datos.hasOwnProperty('pv')) { datos.pv = parseFloat(datos.pv); }
    if (datos.hasOwnProperty('subtotal')) { datos.subtotal = parseFloat(datos.subtotal); }
    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    return docRef;
  }

  // EDITAR
  async editar(ID: any, datos: any) {
    // Convertir a flotante solo si el campo existe
    if (datos.hasOwnProperty('cantidad')) { datos.cantidad = parseFloat(datos.cantidad); }
    if (datos.hasOwnProperty('pc')) { datos.pc = parseFloat(datos.pc); }
    if (datos.hasOwnProperty('pv')) { datos.pv = parseFloat(datos.pv); }
    if (datos.hasOwnProperty('subtotal')) { datos.subtotal = parseFloat(datos.subtotal); }
    const documento = doc(this.firestore, `${this.url}`, ID);
    await updateDoc(documento, datos);
  }

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
  async obtenerConsulta2(datos: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
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

  // OBTENER POR EGRESO
  async obtenerPorEgreso(idEgreso: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('egresoId', '==', idEgreso),
      orderBy('fechaRegistro')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  // OBTENER POR PRODUCTO
  async obtenerPorProducto(idProducto: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('productoId', '==', idProducto),
      orderBy('fecha', 'desc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  // OBTENER POR CODIGO DE BARRA
  async obtenerPorCodigoDeBarra(datos: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('productoCodigoBarra', '==', datos.codigoBarra),
      where('egresoId', '==', datos.idEgreso),
      orderBy('fechaRegistro')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  async obtenerConsulta(datos: any): Promise<EgresoDetalle[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<EgresoDetalle>;
    let condiciones = [];

    /*     if (datos.saldo !== 'TODOS') {
          switch (datos.saldo) {
            case 'MAYOR_A_0':
              condiciones.push(where('cantidadSaldo', '>', 0));
              break;
            case 'MENOR_A_0':
              condiciones.push(where('cantidadSaldo', '<', 0));
              break;
            case 'IGUAL_A_0':
              condiciones.push(where('cantidadSaldo', '==', 0));
              break;
          }
        } */

    // Aplicar condiciones solo si el usuario y el producto no son 'TODOS'
    /*     if (datos.tipo !== 'TODOS') {
          condiciones.push(where('tipo', '==', datos.tipo));
        } */

    if (datos.finalizado !== 'TODOS') {
      const datoBoolean = datos.finalizado === 'true'; // Asegúrate de que sea booleano
      condiciones.push(where('finalizado', '==', datoBoolean));
    }

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('productoCodigo'),
    ];

    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango, limit(datos.limite));

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }

  async obtenerConsultaGestion(datos: any): Promise<EgresoDetalle[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<EgresoDetalle>;
    let condiciones = [];

    if (datos.productoId !== 'TODOS') {
      condiciones.push(where('productoId', '==', datos.productoId));
    }

    if (datos.finalizado !== 'TODOS') {
      const datoBoolean = datos.finalizado === 'true'; // Asegúrate de que sea booleano
      condiciones.push(where('finalizado', '==', datoBoolean));
    }

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('fechaRegistro', 'desc'),
    ];

    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango, limit(datos.limite));

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

  async eliminarPorEgreso(egresoId: any): Promise<void> {
    const coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    const q = query(coleccion, where('egresoId', '==', egresoId));
    const snapshot = await getDocs(q);

    const batchPromises = snapshot.docs.map(async (docSnap) => {
      const ref = doc(this.firestore, `${this.url}`, docSnap.id);
      await deleteDoc(ref);
    });

    await Promise.all(batchPromises);
  }

  // OBTENER CONSULTA REPORTE
  async obtenerConsultaReporte(datos: any): Promise<any[]> {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    let condiciones = [where('activo', '==', true)];

    if (datos.sucursal !== 'TODOS') condiciones.push(where('sucursal', '==', datos.sucursal));
    if (datos.vehiculoId !== 'TODOS') condiciones.push(where('vehiculoId', '==', datos.vehiculoId));
    if (datos.finalizado !== 'TODOS') condiciones.push(where('finalizado', '==', datos.finalizado === 'true'));

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('fecha', 'asc'),
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

  // OBTENER POR SUCURSAL PRODUCTO
  async obtenerPorSucuraslYProducto(idSucursal: any, idProducto: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('sucursal', '==', idSucursal),
      where('productoId', '==', idProducto),
      //orderBy('finalizadoFecha')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  async obtenerReporte(datos: any): Promise<EgresoDetalle[]> {

    console.log('DATOS PARA BUSCAR: ', datos);

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<EgresoDetalle>;
    let condiciones = [];

    if (datos.sucursal !== 'TODOS') {
      condiciones.push(where('sucursal', '==', datos.sucursal));
    }

    if (datos.tipo !== 'TODOS') {
      condiciones.push(where('egresoTipo', '==', datos.tipo));
    }

    if (datos.vehiculo !== 'TODOS') {
      condiciones.push(where('vehiculoId', '==', datos.vehiculo));
    }

    if (datos.producto !== 'TODOS') {
      condiciones.push(where('productoId', '==', datos.producto));
    }

    if (datos.empresa !== 'TODOS') {
      condiciones.push(where('vehiculoEmpresa', '==', datos.empresa));
    }

    if (datos.finalizado !== 'TODOS') {
      const datoBoolean = datos.finalizado === 'true'; // Asegúrate de que sea booleano
      condiciones.push(where('finalizado', '==', datoBoolean));
    }

    // Orden predeterminado y rango de fechas
    const ordenYRango = [
      orderBy('fecha', 'asc'),
      startAt(datos.fechaInicio),
      endAt(datos.fechaFinal),
    ];

    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }
}
