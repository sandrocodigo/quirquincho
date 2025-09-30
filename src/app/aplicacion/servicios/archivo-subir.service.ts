import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ArchivoSubirService {

  private url = 'archivos';

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

  // ONTENER POR ID
  async obtenerPorId(ID: any) {
    const docRef = doc(this.firestore, `${this.url}`, ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  }

  // OBTENER TODOS
  obtenerTodos() {
    return collectionData<any>(
      query<any, any>(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        where('activo', '==', true),
        orderBy('fecha', 'desc')
      ), { idField: 'id' }
    );
  }

}
