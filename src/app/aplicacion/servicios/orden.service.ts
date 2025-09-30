import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore, collection, addDoc, doc, getDoc, updateDoc, onSnapshot, deleteDoc, collectionData, orderBy, query, CollectionReference, where, limit, getDocs, startAt, endAt, Query,
} from '@angular/fire/firestore';
import { Orden } from '../modelos/orden';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {

  private url = 'ordenes';

  private ordenesUrl = 'ordenes';
  private egresosUrl = 'egresos-detalles';

  constructor(private firestore: Firestore) { }


  async crear(datos: any) {
    if ('kilometraje' in datos) { datos.kilometraje = parseFloat(datos.kilometraje); }
    if ('kilometrajeInicio' in datos) { datos.kilometrajeInicio = parseFloat(datos.kilometrajeInicio); }

    if ('kilometrajeActual' in datos) { datos.kilometrajeActual = parseFloat(datos.kilometrajeActual); }
    if ('kilometrajeProximo' in datos) { datos.kilometrajeProximo = parseFloat(datos.kilometrajeProximo); }

    if (datos.codigo == 'nuevo') {
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
    }


    // Buscar el numero más grande en la colección
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      orderBy('numero', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    let nuevoNumero = 1; // Código por defecto en caso de que no haya registros
    querySnapshot.forEach((doc) => {
      if (doc.data().codigo >= nuevoNumero) {
        nuevoNumero = doc.data().numero + 1; // Incrementar el numero más grande
      }
    });
    // Usar el nuevo numero para el nuevo registro
    datos.numero = nuevoNumero;

    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    return docRef;
  }

  // CREAR
  async crear2(datos: any) {

    const ref = collection(this.firestore, this.url);
    const q = query(ref, orderBy('codigo', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);

    let nuevoCodigo = 1; // Valor inicial si no hay registros

    if (!querySnapshot.empty) {
      const ultimoDoc: any = querySnapshot.docs[0].data();
      nuevoCodigo = (ultimoDoc.codigo || 0) + 1;
    }

    datos.codigo = nuevoCodigo;

    if ('kilometraje' in datos) { datos.kilometraje = parseFloat(datos.kilometraje); }
    if ('kilometrajeInicio' in datos) { datos.kilometrajeInicio = parseFloat(datos.kilometrajeInicio); }
    if ('kilometrajeProximo' in datos) { datos.kilometrajeProximo = parseFloat(datos.kilometrajeProximo); }
    const docRef = await addDoc(ref, datos);
    return docRef;
  }

  // EDITAR
  async editar(ID: any, datos: any) {
    if ('kilometraje' in datos) { datos.kilometraje = parseFloat(datos.kilometraje); }
    if ('kilometrajeInicio' in datos) { datos.kilometrajeInicio = parseFloat(datos.kilometrajeInicio); }
    if ('kilometrajeProximo' in datos) { datos.kilometrajeProximo = parseFloat(datos.kilometrajeProximo); }
    const documento = doc(this.firestore, `${this.url}`, ID);
    await updateDoc(documento, datos);
  }

  // OBTENER POR ID
  async obtenerPorId(ID: string): Promise<Orden | null> {
    const docRef = doc(this.firestore, `${this.url}`, ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Orden;
      const { id, ...rest } = data;
      return {
        id: docSnap.id,
        ...rest
      } as Orden & { id: string };
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
  obtenerTodos() {
    return collectionData<Orden>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<Orden>,
        orderBy('fecha', 'desc')
      ), { idField: 'id' }
    );
  }

  // OBTENER POR FECHA Y TURNO
  async obtenerPorFechaYTurnoYUsuario(fecha: any, turno: any, usuario: any): Promise<Orden[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Orden>,
      where('fecha', '==', fecha),
      where('turno', '==', turno),
      where('usuario', '==', usuario),
      orderBy('fechaRegistro', 'asc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: Orden[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as Orden);
      });
      return registros;
    });
  }

  // BUSCAR POR FECHA
  buscarPorFecha(datos: any) {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('fecha', '==', datos.fecha),
      orderBy('turno', 'asc'),
    );

    /*   
          if (datos.turno && datos.turno !== 'TODOS') {
            q = query(
              q,
              where('turno', '==', datos.turno)
            );
          }
    */
    return collectionData<any>(q, { idField: 'id' });
  }

  // BUSCAR POR USUARIO VENDEDOR
  buscarPorUsuario(datos: any) {
    console.log(datos);
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('usuario', '==', datos.usuario),
      orderBy('fecha', 'desc'),
      orderBy('turno', 'asc'),
    );

    /*   
          if (datos.turno && datos.turno !== 'TODOS') {
            q = query(
              q,
              where('turno', '==', datos.turno)
            );
          }
    */
    return collectionData<any>(q, { idField: 'id' });
  }

  // BUSCAR POR USUARIO Y POR FECHAS
  buscarPorUsuarioYPorFechas(datos: any) {
    let q: Query<any>;

    if (datos.usuario === "TODOS") {
      // Si se quiere buscar registros de todos los usuarios
      q = query(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        orderBy('fecha', 'asc'),
        orderBy('turno', 'asc'),
        startAt(datos.fechaInicio),
        endAt(datos.fechaFinal)
      );
    } else {
      // Si se quiere buscar registros de un usuario específico
      q = query(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        where('usuario', '==', datos.usuario),
        orderBy('fecha', 'asc'),
        orderBy('turno', 'asc'),
        startAt(datos.fechaInicio),
        endAt(datos.fechaFinal)
      );
    }

    return collectionData<any>(q, { idField: 'id' });
  }

  // OBTENER CONSULTA
  async obtenerConsulta(datos: any): Promise<any[]> {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    let condiciones = [];

    // Aplicar condiciones solo si el usuario y el producto no son 'TODOS'
    if (datos.vehiculoId !== 'TODOS') {
      condiciones.push(where('vehiculoId', '==', datos.vehiculoId));
    }

    if (datos.activo !== 'TODOS') {
      const activoBoolean = datos.activo === 'true'; // Asegúrate de que sea booleano
      condiciones.push(where('activo', '==', activoBoolean));
    }

    /*     if (Array.isArray(datos.tipo) && datos.tipo.length > 0) {
          condiciones.push(where('tipo', 'in', datos.tipo));
        } else if (datos.tipo !== 'TODOS') {
          condiciones.push(where('tipo', '==', datos.tipo));
        } */


    /*     if (datos.gestion !== 'TODOS') {
          condiciones.push(where('gestion', '==', datos.gestion));
        }
    
        if (datos.mes !== 'TODOS') {
          condiciones.push(where('mes', '==', datos.mes));
        }
    
        if (datos.turno !== 'TODOS') {
          condiciones.push(where('turno', '==', datos.turno));
        }
    
        if (datos.dispensador !== 'TODOS') {
          condiciones.push(where('dispensador', '==', datos.dispensador));
        } */

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('codigo', 'asc'),
      //orderBy('dia', 'asc'),
    ];

    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }

  async obtenerActivos(): Promise<any[]> {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    let condiciones = [
      where('activo', '==', true),
      where('finalizado', '==', false)
    ];

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('codigo', 'asc'),
    ];

    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }


  // OBTENER POR FECHA USUARIO Y TURNO
  obtenerPorFechaYUsuarioYTurno(fecha: any, usuario: any, turno: any) {
    return collectionData<any>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        where('fecha', '==', fecha),
        where('usuario', '==', usuario),
        where('turno', '==', turno)
      ), { idField: 'id' }
    );
  }

  // ELIMINAR
  async eliminar(ID: any) {
    const documento = doc(this.firestore, `${this.url}`, ID);
    await deleteDoc(documento);
  }

  async obtenerUltimoUno(vehiculoId: string): Promise<any> {
    const coleccionRef = collection(this.firestore, `${this.url}`) as CollectionReference<any>;

    const q = query(
      coleccionRef,
      where('vehiculoId', '==', vehiculoId),
      where('finalizado', '==', false),
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

  async obtenerUltimoMuchos(vehiculoId: string): Promise<any> {
    const coleccionRef = collection(this.firestore, `${this.url}`) as CollectionReference<any>;

    const q = query(
      coleccionRef,
      where('vehiculoId', '==', vehiculoId),
      where('finalizado', '==', false),
      where('activo', '==', true),
    );

    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }

  // OBTENER POR CODIGO
  async obtenerPorCodigo(codigo: any): Promise<any> {
    const coleccionRef = collection(this.firestore, `${this.url}`) as CollectionReference<any>;

    const q = query(
      coleccionRef,
      where('codigo', '==', codigo),
      where('activo', '==', true),
    );

    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }


  // OBTENER CONSULTA
  async obtenerConsultaReporte(datos: any): Promise<any[]> {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    let condiciones = [];

    if (datos.sucursal !== 'TODOS') { condiciones.push(where('sucursal', '==', datos.sucursal)); }

    // Aplicar condiciones solo si el usuario y el producto no son 'TODOS'
    if (datos.vehiculoId !== 'TODOS') { condiciones.push(where('vehiculoId', '==', datos.vehiculoId)); }

    if (datos.finalizado !== 'TODOS') {
      const valorBoolean = datos.finalizado === 'true';
      condiciones.push(where('finalizado', '==', valorBoolean));
    }

    if (datos.activo !== 'TODOS') {
      const activoBoolean = datos.activo === 'true'; // Asegúrate de que sea booleano
      condiciones.push(where('activo', '==', activoBoolean));
    }

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('fechaEntrada', 'asc'),
      orderBy('codigo', 'asc'),
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


  async obtenerConsultaRelacionadoReporte(datos: any): Promise<any[]> {
    // 1. Referencia a la colección 'ordenes'
    const coleccion = collection(this.firestore, this.ordenesUrl) as CollectionReference<any>;
    const condiciones = [];

    if (datos.sucursal !== 'TODOS') condiciones.push(where('sucursal', '==', datos.sucursal));
    if (datos.vehiculoId !== 'TODOS') condiciones.push(where('vehiculoId', '==', datos.vehiculoId));
    if (datos.finalizado !== 'TODOS') condiciones.push(where('finalizado', '==', datos.finalizado === 'true'));
    if (datos.activo !== 'TODOS') condiciones.push(where('activo', '==', datos.activo === 'true'));

    const ordenYRango = [
      orderBy('fechaEntrada', 'asc'),
      orderBy('codigo', 'asc'),
      startAt(datos.fechaInicio),
      endAt(datos.fechaFinal),
    ];

    const q = query(coleccion, ...condiciones, ...ordenYRango);
    const querySnapshot = await getDocs(q);

    const ordenes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    // 2. Por cada orden, buscar sus egresos-detalles
    const resultadosConEgresos = await Promise.all(
      ordenes.map(async (orden) => {
        const egresosRef = collection(this.firestore, this.egresosUrl) as CollectionReference<any>;
        const qEgresos = query(egresosRef, where('ordenId', '==', orden.id));
        const egresosSnap = await getDocs(qEgresos);
        const egresos = egresosSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        return {
          ...orden,
          egresos: egresos // adjunta la lista completa de egresos por orden
        };
      })
    );

    return resultadosConEgresos;
  }

}
