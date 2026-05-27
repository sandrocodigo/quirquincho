import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore,
  collectionData,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  orderBy,
  onSnapshot,
  query,
  where,
  getDocs,
  CollectionReference,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  getCountFromServer,
  serverTimestamp
} from '@angular/fire/firestore';
import { Producto } from '../modelos/producto';
import { TituloService } from './titulo.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private url = 'productos';

  private tituloServicio = inject(TituloService);

  constructor(private firestore: Firestore) { }


  // CREAR
  async crear(datos: any) {
    if (datos.hasOwnProperty('precioServicio')) { datos.precioServicio = parseFloat(datos.precioServicio); }
    if (datos.codigo) { datos.codigo = String(datos.codigo).toUpperCase(); }
    if (datos.descripcion) { datos.descripcion = String(datos.descripcion).toUpperCase(); }

    const searchTokens = this.generarSearchTokens(datos);
    const tituloLink = this.generarLink(datos.codigo, datos.descripcion);

    const payload = {
      ...datos,
      searchTokens,
      tituloLink,
      registroFecha: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(this.firestore, `${this.url}`), payload);
    return docRef;
  }

  // EDITAR
  async editar(ID: any, datos: any) {
    if (datos.hasOwnProperty('precioServicio')) { datos.precioServicio = parseFloat(datos.precioServicio); }
    if (datos.hasOwnProperty('pc')) { datos.pc = parseFloat(datos.pc); }
    if (datos.hasOwnProperty('pv')) { datos.pv = parseFloat(datos.pv); }
    if (datos.hasOwnProperty('cantidadTotal')) { datos.cantidadTotal = parseFloat(datos.cantidadTotal); }

    if (datos.codigo) { datos.codigo = String(datos.codigo).toUpperCase(); }
    if (datos.descripcion) { datos.descripcion = String(datos.descripcion).toUpperCase(); }

    // Solo calculamos campos derivados si se proveen los campos base
    const payload: any = {
      ...datos,
      updatedAt: serverTimestamp(),
    };

    if (datos.codigo || datos.descripcion || datos.categoria) {
      payload.searchTokens = this.generarSearchTokens(datos);
      payload.tituloLink = this.generarLink(datos.codigo, datos.descripcion);
    }

    const documento = doc(this.firestore, `${this.url}`, ID);
    await updateDoc(documento, payload);
  }

  private generarLink(codigo: string, descripcion: string): string {
    const cod = this.tituloServicio.convertir(codigo || '');
    const desc = this.tituloServicio.convertir(descripcion || '');
    return `${cod}-${desc}`.substring(0, 50);
  }


  private generarSearchTokens(datos: any): string[] {
    const { codigo, descripcion, categoria, fabricante, detalle } = datos;
    if (!codigo && !descripcion && !categoria && !fabricante && !detalle) return [];

    // Limpiar HTML básico de la descripción y detalle (Quill)
    const descSinHtml = (descripcion || '').replace(/<[^>]*>/g, ' ');
    const detalleSinHtml = (detalle || '').replace(/<[^>]*>/g, ' ');

    // Combinar y normalizar a minúsculas
    const combined = `${codigo || ''} ${descSinHtml} ${categoria || ''} ${fabricante || ''} ${detalleSinHtml}`.toLowerCase();

    // Normalizar: quitar acentos y caracteres especiales
    const normalized = combined
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quita acentos (diacríticos)
      .replace(/[^a-z0-9 ]/g, ' ');    // Deja solo alfa-numéricos y espacios

    // Dividir en palabras y filtrar las de menos de 2 caracteres
    const words = normalized.split(/\s+/).filter(word => word.length >= 2);

    // Retornar solo palabras únicas (Tokens)
    return Array.from(new Set(words));
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

  async obtenerTodosActivos(): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('activo', '==', true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  }

  async migrarProductosTokensYLinks(): Promise<number> {
    const snap = await getDocs(collection(this.firestore, `${this.url}`));
    let count = 0;
    for (const d of snap.docs) {
      const data = d.data();
      const id = d.id;
      const searchTokens = this.generarSearchTokens(data);
      const tituloLink = this.generarLink(data['codigo'], data['descripcion']);
      const documento = doc(this.firestore, `${this.url}`, id);
      await updateDoc(documento, {
        searchTokens,
        tituloLink,
        updatedAt: serverTimestamp()
      });
      count++;
    }
    return count;
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

  private construirFiltrosConsulta(datos: any) {
    const condiciones: any[] = [];

    if (datos?.hasOwnProperty('activo') && datos.activo !== 'TODOS') {
      const activoBoolean = datos.activo === 'true' || datos.activo === true;
      condiciones.push(where('activo', '==', activoBoolean));
    }

    if (datos?.categoria && datos.categoria !== 'TODOS') {
      condiciones.push(where('categoria', '==', datos.categoria));
    }

    if (datos?.fabricante && datos.fabricante !== 'TODOS') {
      condiciones.push(where('fabricante', '==', datos.fabricante));
    }

    if (datos?.tipo && datos.tipo !== 'TODOS') {
      condiciones.push(where('tipo', '==', datos.tipo));
    }

    if (datos?.publicado && datos.publicado !== 'TODOS') {
      const publicadoBoolean = datos.publicado === 'true' || datos.publicado === true;
      condiciones.push(where('publicado', '==', publicadoBoolean));
    }

    const texto = (datos?.texto ?? '').trim().toLowerCase();
    if (texto.length >= 2) {
      const token = texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/)[0];
      condiciones.push(where('searchTokens', 'array-contains', token));
    }

    return condiciones;
  }

  // OBTENER CONSULTA
  async obtenerConsulta(datos: any): Promise<Producto[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Producto>;
    let condiciones = this.construirFiltrosConsulta(datos);

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('codigo'),
    ];

    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }

  async obtenerConteoProductos(datos: any): Promise<number> {
    const coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Producto>;
    const condiciones = this.construirFiltrosConsulta(datos);
    const q = query(coleccion, ...condiciones);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

  async obtenerPaginaProductos(
    datos: any,
    tam: number,
    cursor?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{ items: Producto[]; last: QueryDocumentSnapshot<DocumentData> | null }> {
    const coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Producto>;
    const filtros = this.construirFiltrosConsulta(datos);
    const baseConstraints = [...filtros, orderBy('codigo')];
    const paginacion = cursor
      ? [...baseConstraints, startAfter(cursor), limit(tam)]
      : [...baseConstraints, limit(tam)];

    const q = query(coleccion, ...paginacion);
    const snap = await getDocs(q);
    const items = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Producto);
    const last = snap.docs.at(-1) ?? null;

    return { items, last };
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

  async obtenerConsultaConSaldoReporte(datos: any): Promise<any[]> {
    const coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Producto>;
    const condiciones = [where('activo', '==', true)];

    if (datos.tipo !== 'TODOS') {
      condiciones.push(where('tipo', '==', datos.tipo));
    }

    if (datos.publicado !== 'TODOS') {
      const publicadoBoolean = datos.publicado === 'true';
      condiciones.push(where('publicado', '==', publicadoBoolean));
    }

    const ordenYRango = [orderBy('descripcion')];
    const q = query(coleccion, ...condiciones, ...ordenYRango);
    const querySnapshot = await getDocs(q);

    const productos = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    const saldosPorProducto: any = {};
    const pvPorProducto: any = {};

    // Obtener todos los ingresos-detalles
    const ingresosDetallesSnapshot = await getDocs(collection(this.firestore, 'ingresos-detalles'));

    ingresosDetallesSnapshot.forEach(doc => {
      const detalle: any = doc.data();

      // ✅ Filtrar por sucursal si corresponde
      if (datos.sucursal !== 'TODOS' && detalle.sucursal !== datos.sucursal) {
        return; // ignorar si no corresponde
      }

      // Sumar cantidadSaldo por producto
      if (detalle.productoId && detalle.cantidadSaldo) {
        if (!saldosPorProducto[detalle.productoId]) {
          saldosPorProducto[detalle.productoId] = 0;
        }
        saldosPorProducto[detalle.productoId] += detalle.cantidadSaldo;
      }

      // Guardar último precio de venta
      if (detalle.productoId && detalle.pv) {
        pvPorProducto[detalle.productoId] = detalle.pv;
      }
    });

    // Mezclar datos en los productos
    const productosConSaldo = productos.map(producto => ({
      ...producto,
      cantidadSaldoTotal: saldosPorProducto[producto.id] || 0,
      precioVenta: pvPorProducto[producto.id] || 0
    }));

    return productosConSaldo;
  }


  /*   async obtenerConsultaConSaldoPublicado(datos: any): Promise<any[]> {
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
  
    async obtenerConsultaConSaldoReporte(datos: any): Promise<any[]> {
      let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Producto>;
      let condiciones = [where('activo', '==', true)];
  
      if (datos.tipo !== 'TODOS') {
        condiciones.push(where('tipo', '==', datos.tipo));
      }
  
      if (datos.publicado !== 'TODOS') {
        const publicadoBoolean = datos.publicado === 'true'; // Asegúrate de que sea booleano
        condiciones.push(where('publicado', '==', publicadoBoolean));
      }
  
      // Orden predeterminado y rango de fechas
      let ordenYRango = [orderBy('codigo')];
  
      // Crear la consulta con filtros y orden
      let q = query(coleccion, ...condiciones, ...ordenYRango, limit(datos.limite));
  
      // Ejecutar la consulta de productos
      const querySnapshot = await getDocs(q);
      const productos = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
  
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
    } */


  // OBTENER POR TIPO
  async obtenerPorTipo(tipo: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('tipo', '==', tipo),
      where('publicado', '==', true)
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  async obtenerFavoritosPorCategoria(categoria: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('categoria', '==', categoria),
      where('favorito', '==', true),
      where('activo', '==', true)
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }


  async obtenerPorCampo(link: string) {
    const q = query(collection(this.firestore, this.url), where("tituloLink", "==", link));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Como esperamos un único resultado, tomamos el primer documento
      const doc = querySnapshot.docs[0];
      return doc.data(); // Devuelve los datos del primer documento encontrado
    } else {
      return null; // No se encontraron documentos
    }
  }

  async obtenerPorCodigoBarra(codigoBarra: string) {
    const q = query(collection(this.firestore, this.url), where("codigoBarra", "==", codigoBarra));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Como esperamos un único resultado, tomamos el primer documento
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,         // Incluimos el ID del documento
        ...doc.data(),      // Incluimos también los datos del documento
      };
    } else {
      return null; // No se encontraron documentos
    }
  }


}
