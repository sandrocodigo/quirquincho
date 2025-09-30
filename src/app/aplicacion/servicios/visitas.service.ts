import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class VisitasService {

  private url = 'visitas';

  constructor(private firestore: Firestore) { }

  // CREAR
  async crear(datos: any) {
    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    return docRef;
  }

  // CREAR CON ID
  async crearConId(datos: any) {
    const docRef = doc(collection(this.firestore, `${this.url}`), datos.idEgreso);
    await setDoc(docRef, datos);
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
  async obtenerTodos(): Promise<any[]> {
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

  // OBTENER TODOS EN TIEMPO REAL
  obtenerTodosTR() {
    return collectionData<any>(
      query<any, any>(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        // orderBy('ordenar')
      ), { idField: 'id' }
    );
  }

  // OBTENER CONSULTA
  async obtenerConsulta(datos: any): Promise<any[]> {
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

  // INCREMENTAR VISITA
  async incrementarVisita() {
    const docRef = doc(this.firestore, `${this.url}`, 'contador');

    // Verificar si el documento existe
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // Si el documento existe, incrementamos el campo 'count'
      const currentCount = docSnap.data()?.['count'] ?? 0;
      await updateDoc(docRef, { count: currentCount + 1 });
    } else {
      // Si no existe, lo creamos con valor inicial de 1
      await setDoc(docRef, { count: 1 });
    }
  }

  // OBTENER EL CONTADOR EN TIEMPO REAL
  obtenerContadorVisitasTR(): Observable<any | null> {
    const docRef = doc(this.firestore, `${this.url}`, 'contador');
    return new Observable((subscriber) => {
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          subscriber.next(docSnap.data()?.['count']);
        } else {
          subscriber.next(0);
        }
      });
      return unsubscribe;
    });
  }

}
