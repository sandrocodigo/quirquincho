import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference, limit, startAt, endAt, Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class IngresoService {

  private url = 'ingresos';

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
  async obtenerConsultaANTES(datos: any): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      orderBy('codigo', 'desc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }


  // OBTENER CONSULTA
  async obtenerConsulta5(datos: any): Promise<any[]> {
    console.log(datos);
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    let condiciones = [];

    // Verificación del campo finalizado
    if (datos.finalizado !== 'TODOS') {
      const valorBoolean = datos.finalizado === 'true';
      condiciones.push(where('finalizado', '==', valorBoolean));
    }

    // Conversión de fechas de string a Timestamp
    const fechaInicioTimestamp = Timestamp.fromDate(new Date(datos.fechaInicio));
    const fechaFinalTimestamp = Timestamp.fromDate(new Date(datos.fechaFinal));

    // Orden y rango de fechas
    let ordenYRango = [
      orderBy('fechaRegistro', 'asc'),
      orderBy('codigo', 'desc'),
      startAt(fechaInicioTimestamp),
      endAt(fechaFinalTimestamp)
    ];

    // Crear la consulta combinada
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
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


}
