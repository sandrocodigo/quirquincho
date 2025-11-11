import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference, deleteDoc, limit, startAt, endAt } from '@angular/fire/firestore';
import { IngresoDetalle } from '../modelos/ingreso-detalle';

@Injectable({
  providedIn: 'root'
})
export class IngresoDetalleService {

  private url = 'ingresos-detalles';

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

  async obtenerConsulta(datos: any): Promise<IngresoDetalle[]> {

    console.log('DATOS PARA BUSCAR: ', datos);

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<IngresoDetalle>;
    let condiciones = [];

    if (datos.saldo !== 'TODOS') {
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
    }

    if (datos.productoId !== 'TODOS') {
      condiciones.push(where('productoId', '==', datos.productoId));
    }


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


  // OBTENER POR INGRESO
  async obtenerPorIngreso(idIngreso: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('ingresoId', '==', idIngreso),
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
    console.log('ID PRODUCTO: ', idProducto);
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

  // OBTENER POR PRODUCTO
  async obtenerPorProductoParaVender(idProducto: any): Promise<any[]> {
    console.log('ID PRODUCTO: ', idProducto);
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('productoId', '==', idProducto),
      where('cantidadSaldo', '>', 0),
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
  async obtenerPorProductoAprobados(data: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('productoId', '==', data.idProducto),
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


  // OBTENER POR PRODUCTO Y CON SALDO
  async obtenerPorProductoYconSaldo(idProducto: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('productoId', '==', idProducto),
      where('cantidadSaldo', '>', 0),
      orderBy('cantidadSaldo'),
      orderBy('fecha')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  // OBTENER POR ID PRODUCTO
  async obtenerPorIdProducto(sucursal: any, productoID: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('sucursal', '==', sucursal),
      where('productoId', '==', productoID),
      where('cantidadSaldo', '>', 0),
      where('finalizado', '==', true),
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

  // OBTENER POR CODIGO DE BARRA DE PRODUCTO
  async obtenerPorCodigoDeBarra(datos: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('productoCodigoBarra', '==', datos.codigoBarra),
      where('cantidadSaldo', '>', 0),
      where('finalizado', '==', true),
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

  // OBTENER POR CODIGO DE BARRA SIN SALDO
  async obtenerPorCodigoDeBarraSinSaldo(datos: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('productoCodigoBarra', '==', datos.codigoBarra),
      where('finalizado', '==', true),
      orderBy('fechaRegistro', 'desc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  // VERIFICAR POR CODIGO DE BARRA
  async verificarPorCodigoDeBarra(datos: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('productoCodigoBarra', '==', datos.codigoBarra),
      where('ingresoId', '==', datos.idIngreso)
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

  async obtenerConsultaGestion(datos: any): Promise<IngresoDetalle[]> {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<IngresoDetalle>;
    let condiciones = [];

    if (datos.saldo !== 'TODOS') {
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
    }

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


  // OBTENER POR SUCURSAL PRODUCTO
  async obtenerPorSucuraslYProducto(idSucursal: any, idProducto: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('sucursal', '==', idSucursal),
      where('productoId', '==', idProducto),
      orderBy('fechaAprobacion')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  async obtenerReporte(datos: any): Promise<IngresoDetalle[]> {

    console.log('DATOS PARA BUSCAR: ', datos);

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<IngresoDetalle>;
    let condiciones = [];

    if (datos.sucursal !== 'TODOS') {
      condiciones.push(where('sucursal', '==', datos.sucursal));
    }

    if (datos.tipo !== 'TODOS') {
      condiciones.push(where('ingresoTipo', '==', datos.tipo));
    }

    if (datos.producto !== 'TODOS') {
      condiciones.push(where('productoId', '==', datos.producto));
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
