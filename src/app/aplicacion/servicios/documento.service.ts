import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore, collection, addDoc, doc, getDoc, updateDoc, onSnapshot, deleteDoc, collectionData, orderBy, query, CollectionReference, where, limit, getDocs, startAt, endAt, Query,
} from '@angular/fire/firestore';
import { Programacion } from '../modelos/programacion';


@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

  private url = 'documentos';

  constructor(private firestore: Firestore) { }

  // CREAR
  async crear(datos: any) {
    if ('kilometraje' in datos) { datos.kilometraje = parseFloat(datos.kilometraje); }
    if ('kilometrajeInicio' in datos) { datos.kilometrajeInicio = parseFloat(datos.kilometrajeInicio); }
    if ('kilometrajeProximo' in datos) { datos.kilometrajeProximo = parseFloat(datos.kilometrajeProximo); }
    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
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
  async obtenerPorId(ID: any): Promise<Programacion | null> {
    const docRef = doc(this.firestore, `${this.url}`, ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Programacion;
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
    return collectionData<Programacion>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<Programacion>,
        orderBy('fecha', 'desc')
      ), { idField: 'id' }
    );
  }

  // OBTENER POR FECHA Y TURNO
  async obtenerPorFechaYTurnoYUsuario(fecha: any, turno: any, usuario: any): Promise<Programacion[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Programacion>,
      where('fecha', '==', fecha),
      where('turno', '==', turno),
      where('usuario', '==', usuario),
      orderBy('fechaRegistro', 'asc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: Programacion[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as Programacion);
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

    if (datos.tipo !== 'TODOS') {
      condiciones.push(where('documentoTipo', '==', datos.tipo));
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
      orderBy('vehiculoNumero', 'asc'),
      //orderBy('dia', 'asc'),
    ];

    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }

  // OBTENER CONSULTA
  async obtenerConsulta2(datos: any): Promise<any[]> {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    let condiciones = [];

    // Este campo debe ser gestionable directamente en el nivel del documento
    if (datos.fecha !== 'TODOS') {
      condiciones.push(where('fecha', '==', datos.fecha));
    }

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('fecha', 'asc')
    ];

    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    let registros: any = [];
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.registros) {
        data.registros.forEach((reg: any) => {
          if ((datos.usuario === 'TODOS' || reg.usuario === datos.usuario) &&
            (datos.turno === 'TODOS' || reg.turno === datos.turno) &&
            (datos.dispensador === 'TODOS' || reg.dispensador.includes(datos.dispensador))) {
            registros.push({ ...reg, fecha: data.fecha, id: doc.id });
          }
        });
      }
    });

    return registros;
  }


  // OBTENER CONSULTA
  async obtenerConsultaFinalizado(datos: any): Promise<any[]> {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    let condiciones = [where('finalizado', '==', true)];

    // Aplicar condiciones solo si el usuario y el producto no son 'TODOS'
    /*     if (datos.usuario !== 'TODOS') {
          condiciones.push(where('usuario', '==', datos.usuario));
        } */

    if (datos.gestion !== 'TODOS') {
      condiciones.push(where('gestion', '==', datos.gestion));
    }

    if (datos.mes !== 'TODOS') {
      condiciones.push(where('mes', '==', datos.mes));
    }

    if (datos.periodo !== 'TODOS') {
      condiciones.push(where('periodo', '==', datos.periodo));
    }

    if (datos.planillaNumero !== 'TODOS') {
      condiciones.push(where('planillaNumero', '==', datos.planillaNumero));
    }

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('mes', 'asc'),
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

  async obtenerUltimo(empresa: string): Promise<any> {
    const coleccionRef = collection(this.firestore, `${this.url}`) as CollectionReference<any>;

    const q = query(
      coleccionRef,
      where('empresa', '==', empresa),
      orderBy('orden', 'desc'),
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
