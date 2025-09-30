import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc, orderBy, onSnapshot, query, where, getDocs, CollectionReference, deleteDoc } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

@Injectable({
  providedIn: 'root'
})
export class ArchivoService {

  private url = 'archivos';
  avance = 0;
  fechaHoy = new Date();

  constructor(private firestore: Firestore) { }

  // SUBIR
  subir(file: any) {
    const storage = getStorage();

    // Create the file metadata
    /** @type {any} */
    const metadata = {
      contentType: 'image/jpeg'
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    const storageRef = ref(storage, 'archivos/' + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.avance = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;

          // ...
          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
          this.crear({ url: downloadURL, nombre: file.name, fechaRegistro: this.fechaHoy }).then((res => {
            console.log('Archivo: ', res);
          }));
        });
      }
    );
  }


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
  obtenerTodosTR() {
    return collectionData<any>(
      query<any, any>(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        orderBy('fechaRegistro', 'desc')
      ), { idField: 'id' }
    );
  }

  async obtenerTodos(): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      orderBy('fechaRegistro', 'desc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  async obtenerTodosImagenes(): Promise<any[]> {
    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('clase', '==', 'image'),
      orderBy('fechaRegistro', 'desc')
    );
    return getDocs(q).then((querySnapshot) => {
      const registros: any[] = [];
      querySnapshot.forEach((doc) => {
        registros.push({ ...doc.data(), id: doc.id } as any);
      });
      return registros;
    });
  }

  async obtenerPorClase(clase: any): Promise<any[]> {

    let q = query(
      collection(this.firestore, `${this.url}`) as CollectionReference<any>,
      where('clase', '==', 'image'),
      orderBy('fechaRegistro', 'desc')
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
  async obtenerConsulta(datos: any): Promise<any[]> {
    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<any>;
    let condiciones = [];
    let ordenYRango = [orderBy('fechaRegistro', 'desc')];

    // Aplicar condiciones solo si el usuario y el producto no son 'TODOS'
    if (datos.clase !== 'TODOS') {
      condiciones.push(where('clase', '==', datos.clase));
    }

    // console.log('CONDICIONOES:' , condiciones)
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }


  public get porcentaje(): any {
    return this.avance;
  }

  // ELIMINAR
  async eliminar(ID: any) {
    const documento = doc(this.firestore, `${this.url}`, ID);
    await deleteDoc(documento);
  }

}
