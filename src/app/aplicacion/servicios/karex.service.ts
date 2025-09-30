import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference, deleteDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class KardexService {

  private url = 'kardex';

  constructor(private firestore: Firestore) { }

  // CREAR
  async crear(datos: any) {
    if (datos.hasOwnProperty('cantidad')) {
      datos.cantidad = parseFloat(datos.cantidad);
    }
    if (datos.hasOwnProperty('pc')) {
      datos.pc = parseFloat(datos.pc);
    }
    if (datos.hasOwnProperty('pv')) {
      datos.pv = parseFloat(datos.pv);
    }
    if (datos.hasOwnProperty('subtotal')) {
      datos.subtotal = parseFloat(datos.subtotal);
    }

    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    return docRef;
  }

  async editar(ID: any, datos: any) {
    // Convertir a flotante solo si el campo existe
    if (datos.hasOwnProperty('cantidad')) {
      datos.cantidad = parseFloat(datos.cantidad);
    }
    if (datos.hasOwnProperty('pc')) {
      datos.pc = parseFloat(datos.pc);
    }
    if (datos.hasOwnProperty('pv')) {
      datos.pv = parseFloat(datos.pv);
    }
    if (datos.hasOwnProperty('subtotal')) {
      datos.subtotal = parseFloat(datos.subtotal);
    }

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
      query<any,any>(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        orderBy('ordenar')
      ), { idField: 'id' }
    );
  }

  // OBTENER CONSULTA
  async obtenerConsulta(datos: any): Promise<any[]> {
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

  // OBTENER POR INGRESO
  async obtenerPorIngreso(idIngreso: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('ingresoId', '==', idIngreso)
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

  // OBTENER POR PRODUCTO
  async obtenerPorProducto(idProducto: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('productoId', '==', idProducto),
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

  // OBTENER POR CODIGO DE BARRA
  async obtenerPorCodigoDeBarra(datos: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('productoCodigoBarra', '==', datos.codigoBarra),
      where('cantidadSaldo', '>', 0),
      where('finalizado', '==', true)
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

  // OBTENER POR CODIGO DE BARRA SIN SALDO
  async obtenerPorCodigoDeBarraSinSaldo(datos: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('productoCodigoBarra', '==', datos.codigoBarra),
      where('finalizado', '==', true)
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

  // ELIMINAR
  async eliminar(ID: any) {
    const documento = doc(this.firestore, `${this.url}`, ID);
    await deleteDoc(documento);
  }

}
