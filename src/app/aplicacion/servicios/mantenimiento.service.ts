import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {

  private url = 'mantenimientos';

  constructor(private firestore: Firestore) { }

// CREAR CON ID INCREMENTAL SEGÚN TIPO
async crear(datos: any): Promise<string> {
  const tipo = datos.tipo;
  const ref = collection(this.firestore, `${this.url}`);

  // Obtener todos del mismo tipo
  const q = query(ref, where('tipo', '==', tipo));
  const snapshot = await getDocs(q);

  // Calcular el siguiente ID incremental
  let maxId = 0;
  snapshot.forEach(doc => {
    const docId = parseInt(doc.id, 10);
    if (!isNaN(docId)) {
      maxId = Math.max(maxId, docId);
    }
  });

  const nuevoId = (maxId + 1).toString();

  // Guardar el documento con ID definido
  await setDoc(doc(ref, nuevoId), datos);
  return nuevoId;
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
  obtenerTodosTR() {
    return collectionData<any>(
      query<any, any>(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        // where('activo', '==', true),
        orderBy('descripcion')
      ), { idField: 'id' }
    );
  }

  // OBTENER TODOS
  async obtenerTodos(): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      orderBy('descripcion')
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
  async obtenerTodosFavoritos(): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('favorito', '==', true),
      orderBy('descripcion')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }


  // MIGRAR LOTE DE DATOS
  async migrarLote(lista: any[]): Promise<void> {
    const ref = collection(this.firestore, `${this.url}`);
    for (const item of lista) {
      const { id, ...resto } = item;
      await setDoc(doc(ref, id), resto);
    }
  }

}
