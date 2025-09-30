import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, CollectionReference, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  private url = 'proveedores';

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
  async obtenerTodosANTES(): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      // orderBy('codigo')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  // OBTENER TODOS
  obtenerTodos(): Observable<any[]> {
    const coleccion = collection(this.firestore, this.url); // Utiliza la colección desde Firestore
    return collectionData(coleccion, { idField: 'id' }); // Usa collectionData en lugar de getDocs
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

  async obtenerConsultaConSaldo(datos: any): Promise<any[]> {
    // Obtener todos los productos
    const productosSnapshot = await getDocs(collection(this.firestore, 'productos'));
    const productos = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Inicializar objetos para mantener la suma de saldos y el último pv
    const saldosPorProducto: any = {};
    const pvPorProducto: any = {};

    // Obtener todos los detalles de ingresos
    const ingresosDetallesSnapshot = await getDocs(collection(this.firestore, 'ingresos-detalles'));
    ingresosDetallesSnapshot.forEach(doc => {
      const detalle: any = doc.data();

      // Sumar la cantidadSaldo al producto correspondiente
      if (detalle.productoId && detalle.cantidadSaldo) {
        if (!saldosPorProducto[detalle.productoId]) {
          saldosPorProducto[detalle.productoId] = 0;
        }
        saldosPorProducto[detalle.productoId] += detalle.cantidadSaldo;
      }

      // Actualizar el último pv para el producto
      if (detalle.productoId && detalle.pv) {
        pvPorProducto[detalle.productoId] = detalle.pv;
      }
    });

    // Agregar la cantidadSaldo total y el último pv a cada producto
    const productosConSaldo = productos.map(producto => ({
      ...producto,
      cantidadSaldoTotal: saldosPorProducto[producto.id] || 0,
      precioVenta: pvPorProducto[producto.id] || 0
    }));

    return productosConSaldo;
  }


  async obtenerConsultaConSaldoPublicado(datos: any): Promise<any[]> {
    // Obtener productos que tienen 'publicado' igual a true
    const productosRef = collection(this.firestore, 'productos');
    const q = query(productosRef, where('publicado', '==', true));
    const productosSnapshot = await getDocs(q);
    const productos = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));


    // Inicializar objetos para mantener la suma de saldos y el último pv
    const saldosPorProducto: any = {};
    const pvPorProducto: any = {};

    // Obtener todos los detalles de ingresos
    const ingresosDetallesSnapshot = await getDocs(collection(this.firestore, 'ingresos-detalles'));
    ingresosDetallesSnapshot.forEach(doc => {
      const detalle: any = doc.data();

      // Sumar la cantidadSaldo al producto correspondiente
      if (detalle.productoId && detalle.cantidadSaldo) {
        if (!saldosPorProducto[detalle.productoId]) {
          saldosPorProducto[detalle.productoId] = 0;
        }
        saldosPorProducto[detalle.productoId] += detalle.cantidadSaldo;
      }

      // Actualizar el último pv para el producto
      if (detalle.productoId && detalle.pv) {
        pvPorProducto[detalle.productoId] = detalle.pv;
      }
    });

    // Agregar la cantidadSaldo total y el último pv a cada producto
    const productosConSaldo = productos.map(producto => ({
      ...producto,
      cantidadSaldoTotal: saldosPorProducto[producto.id] || 0,
      precioVenta: pvPorProducto[producto.id] || 0
    }));

    return productosConSaldo;
  }

}
