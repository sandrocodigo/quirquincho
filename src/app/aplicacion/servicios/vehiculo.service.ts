import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore, collection, addDoc, doc, getDoc, updateDoc, onSnapshot, deleteDoc, collectionData, orderBy, query, CollectionReference, where, limit, getDocs, startAt, endAt,
} from '@angular/fire/firestore';
import { Vehiculo } from '../modelos/vehiculo';



@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  private url = 'vehiculos';

  constructor(private firestore: Firestore) { }

  // CREAR
  async crear(datos: any) {
    if (datos.hasOwnProperty('litros')) { datos.litros = parseFloat(datos.litros); }
    if (datos.hasOwnProperty('ordenLitros')) { datos.ordenLitros = parseFloat(datos.ordenLitros); }
    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    return docRef;
  }

  // EDITAR
  async editar(ID: any, datos: any) {
    if (datos.hasOwnProperty('litros')) { datos.litros = parseFloat(datos.litros); }
    if (datos.hasOwnProperty('orden')) { datos.orden = parseFloat(datos.orden); }
    if (datos.hasOwnProperty('ordenLitros')) { datos.ordenLitros = parseFloat(datos.ordenLitros); }

    const documento = doc(this.firestore, `${this.url}`, ID);
    await updateDoc(documento, datos);
  }

  // EDITAR
  async editarPorEmpresaYPlaca(empresa: string, placa: string, nuevosDatos: any) {
    if (nuevosDatos.hasOwnProperty('litros')) { nuevosDatos.litros = parseFloat(nuevosDatos.litros); }
    if (nuevosDatos.hasOwnProperty('orden')) { nuevosDatos.orden = parseFloat(nuevosDatos.orden); }
    if (nuevosDatos.hasOwnProperty('ordenLitros')) { nuevosDatos.ordenLitros = parseFloat(nuevosDatos.ordenLitros); }

    const coleccionRef = collection(this.firestore, `${this.url}`);

    // Realiza la consulta para encontrar el documento basado en empresa y placa
    const q = query(coleccionRef, where('empresa', '==', empresa), where('placa', '==', placa));

    const querySnapshot = await getDocs(q);

    // Si se encuentra el documento, actualiza los campos
    querySnapshot.forEach(async (documento) => {
      const documentoRef = doc(this.firestore, `${this.url}`, documento.id);
      await updateDoc(documentoRef, nuevosDatos);
    });

    // Si no hay resultados, puedes manejar el error aquí si lo deseas
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
    return collectionData<Vehiculo>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<Vehiculo>,
        orderBy('numero')
      ), { idField: 'id' }
    );
  }

  // OBTENER TODOS
  async obtenerTodos(): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('activo', '==', true),
      orderBy('placa')
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
      where('activo', '==', true),
      orderBy('placa')
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
  async obtenerPorFechaYTurnoYUsuario(fecha: any, turno: any, usuario: any): Promise<Vehiculo[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Vehiculo>,
      where('fecha', '==', fecha),
      where('turno', '==', turno),
      where('usuario', '==', usuario),
      orderBy('fechaRegistro', 'asc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: Vehiculo[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as Vehiculo);
      });
      return registros;
    });
  }

  // OBTENER POR EMPRESA
  async obtenerPorEmpresa(empresa: any): Promise<Vehiculo[]> {
    console.log(empresa);
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Vehiculo>,
      where('empresa', '==', empresa),
      orderBy('placa', 'asc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: Vehiculo[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as Vehiculo);
      });
      return registros;
    });
  }

  async obtenerPorUsuario(usuarioId: any): Promise<Vehiculo | null> {
    // Construir la consulta
    const q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Vehiculo>,
      where('conductorEmail', '==', usuarioId)
    );

    // Ejecutar la consulta y obtener el primer documento
    return getDocs(q).then((querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]; // Obtener el primer documento
        return { ...doc.data(), id: doc.id } as Vehiculo;
      }
      return null; // Si no hay documentos que coincidan
    });
  }


  // OBTENER POR EMPRESA Y PLACA
  async obtenerPorEmpresaYPlaca(empresa: any, placa: any): Promise<Vehiculo[]> {
    console.log(empresa);
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Vehiculo>,
      where('empresa', '==', empresa),
      where('placa', '==', placa)
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: Vehiculo[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as Vehiculo);
      });
      return registros;
    });
  }

  async obtenerPorPlaca(placa: any): Promise<Vehiculo | null> {
    const placas = placa.toUpperCase();
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Vehiculo>,
      where('placa', '==', placas)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    } else {
      const doc = querySnapshot.docs[0];
      return { ...doc.data(), id: doc.id } as Vehiculo;
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


  async obtenerConsulta(datos: any): Promise<Vehiculo[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Vehiculo>;
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
      orderBy('numero', 'desc'),
    ];


    // Combinar condiciones, orden y rango para crear la consulta
    let q = query(coleccion, ...condiciones, ...ordenYRango, limit(datos.limite));

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }

  async obtenerConsultaPorTipo(datos: any): Promise<Vehiculo[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Vehiculo>;
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
