import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference, deleteDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FotoService {

  private url = 'fotos';
  lista: any;

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

  // ELIMINAR
  async eliminar(ID: any) {
    const documento = doc(this.firestore, `${this.url}`, ID);
    await deleteDoc(documento);
  }

  // OBTENER TODOS
  obtenerTodosTR() {
    return collectionData<any>(
      query<any,any>(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        orderBy('codigo')
      ), { idField: 'id' }
    );
  }

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

  obtenerConsultaTR(datos: any) {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      orderBy('codigo')
    );
    if (datos !== 'todos') {
      q = query(
        q,
        where('departamento', '==', datos)
      );
    }
    return collectionData<any>(q, { idField: 'id' });
  }

  async obtenerConsulta(codigo: any): Promise<any[]> {
    console.log('CONSULTA: ', codigo)
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      orderBy('codigo')
    );
    if (codigo !== 'todos') {
      q = query(
        q,
        where('codigo', '==', codigo)
      );
    }
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  // OBTENER POR CODIGO
  obtenerPorCodigoTR(codigo: any) {
    return collectionData<any>(
      query<any,any>(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        where('codigo', '==', codigo),
      ), { idField: 'id' }
    );
  }

  async obtenerPorId(ID: any) {
    const docRef = doc(this.firestore, `${this.url}`, ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  }

  // ONTENER TODOS
  obtener() {
    this.lista = collection(this.firestore, `${this.url}`), orderBy("tipo"), { idField: 'id' };
    console.log('DATOS CRUDOS; ', this.lista);
    return collectionData(this.lista);
  }




  obtener5() {
    return collectionData<any>(
      query<any,any>(
        collection(this.firestore, 'tramites') as CollectionReference<any>,
        where('codigo', '==', 'N-2')
      ), { idField: 'id' }
    );
  }

  // OBTENER
  async obtener2() {
    const q = query(collection(this.firestore, "tramites"));
    const querySnapshot = await getDocs(q)
    return querySnapshot.forEach((doc) => {
      const data = doc.data() as any;
      data.id = doc.id;
      return data;
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
    });



  }

  obtener3() {
    const q = query(collection(this.firestore, "cities"), where("state", "==", "CA"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cities: any = [];
      querySnapshot.forEach((doc: any) => {
        cities.push(doc.data().name);
      });
      console.log("Current cities in CA: ", cities.join(", "));
    });
    return unsubscribe;
  }

  obtener4() {
    const q = query(collection(this.firestore, "tramites"));
    return onSnapshot(q, (querySnapshot) => {
      return querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        data.id = doc.id;
        return data;
      });
    });
  }

}
