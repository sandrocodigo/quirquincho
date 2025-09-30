import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore, collection, addDoc, doc, getDoc, updateDoc, onSnapshot, deleteDoc, collectionData, orderBy, query, CollectionReference, where, limit, getDocs, startAt, endAt,
} from '@angular/fire/firestore';
import { Plan } from '../modelos/plan';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private url = 'planes';

  constructor(private firestore: Firestore) { }

  // CREAR
  async crear(datos: any) {
    if ('gestion' in datos) { datos.gestion = parseFloat(datos.gestion); }
    if ('mes' in datos) { datos.mes = parseFloat(datos.mes); }
    if ('monto' in datos) { datos.monto = parseFloat(datos.monto); }
    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    return docRef;
  }

  // EDITAR
  async editar(ID: any, datos: any) {
    if ('gestion' in datos) { datos.gestion = parseFloat(datos.gestion); }
    if ('mes' in datos) { datos.mes = parseFloat(datos.mes); }
    if ('monto' in datos) { datos.monto = parseFloat(datos.monto); }
    const documento = doc(this.firestore, `${this.url}`, ID);
    await updateDoc(documento, datos);
  }

  async obtenerPorId(ID: any): Promise<Plan | null> {
    const docRef = doc(this.firestore, `${this.url}`, ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Plan;
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
    return collectionData<Plan>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<Plan>,
        orderBy('gestion', 'desc'),
        orderBy('mes', 'desc')
      ), { idField: 'id' }
    );
  }

  // OBTENER TODOS
  async obtenerTodos(): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      orderBy('gestion', 'desc'),
      orderBy('mes', 'desc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }


  // VERUFICAR PAGO
  async verificarPagoActual(): Promise<any> {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1; // Los meses en JavaScript comienzan desde 0
    const añoActual = hoy.getFullYear();

    let q = query(
      collection(this.firestore, `${this.url}`),
      where('gestion', '==', añoActual),
      where('mes', '==', mesActual)
    );

    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    // Encontrar el primer registro no pagado y con fecha límite vencida
    const registroPendiente = registros.find((registro: any) => {
      const fechaLimite = new Date(registro.fechaLimite);
      return !registro.pagado && hoy > fechaLimite;
    });

    return registroPendiente || null;
  }

  async verificarPagosPendientes(): Promise<any[]> {
    const hoy = new Date();
    const gestionActual = hoy.getFullYear();
    let gestionConsulta = gestionActual;
    // Si estamos en enero, verifica los pagos pendientes del año anterior también.
    if (hoy.getMonth() === 0) {
      gestionConsulta = gestionActual - 1;
    }

    // Primero, obtenemos todos los registros del año de consulta
    let q = query(
      collection(this.firestore, `${this.url}`),
      where('gestion', '>=', gestionConsulta),
      where('pagado', '==', false)
    );

    const querySnapshot = await getDocs(q);
    let registrosPendientes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    // Luego, filtramos los registros para obtener solo aquellos con fecha límite antes de hoy
    registrosPendientes = registrosPendientes.filter((registro: any) => {
      const fechaLimite = new Date(registro.fechaLimite);
      return fechaLimite <= hoy;
    });

    return registrosPendientes;
  }



  // OBTENER POR FECHA Y TURNO
  async obtenerPorFechaYTurnoYUsuario(fecha: any, turno: any, usuario: any): Promise<Plan[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<Plan>,
      where('fecha', '==', fecha),
      where('turno', '==', turno),
      where('usuario', '==', usuario),
      orderBy('fechaRegistro', 'asc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: Plan[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as Plan);
      });
      return registros;
    });
  }

  // ELIMINAR
  async eliminar(ID: any) {
    const documento = doc(this.firestore, `${this.url}`, ID);
    await deleteDoc(documento);
  }

  obtenerConsulta(datos: any) {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;

    // Inicializamos con la condición aprobado=true
    const condiciones = [where('aprobado', '==', true)];

    if (datos.usuario !== 'TODOS') {
      condiciones.push(where('usuario', '==', datos.usuario));
    }

    if (datos.empresa !== 'TODOS') {
      condiciones.push(where('empresa', '==', datos.empresa));
    }

    // Si hay condiciones adicionales, actualizamos la consulta
    let q;
    if (condiciones.length > 0) {
      q = query(
        coleccion,
        ...condiciones,
        orderBy('fecha', 'asc'),
        startAt(datos.fechaInicio),
        endAt(datos.fechaFinal)
      );
    } else {
      q = query(
        coleccion,
        orderBy('fecha', 'asc'),
        startAt(datos.fechaInicio),
        endAt(datos.fechaFinal),
        where('aprobado', '==', true)  // Se asegura de que la condición de aprobado siempre esté presente
      );
    }

    return collectionData<any>(q, { idField: 'id' });
  }

}
