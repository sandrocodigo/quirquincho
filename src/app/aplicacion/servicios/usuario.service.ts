import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import {
  Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc,
  orderBy, onSnapshot, query, where, getDocs, CollectionReference, deleteDoc, docData, arrayRemove, writeBatch, arrayUnion
} from '@angular/fire/firestore';
import { limit } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { Usuario2 } from '../modelos/usuario2';


interface User {
  proyectos?: string[];
  // ...otros campos del usuario
}

interface Project {
  id?: string;
  // ...otros campos del proyecto
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private url = 'usuarios';

  constructor(private firestore: Firestore, private auth: AuthService) { }

  // CREAR
  async crear(datos: any) {
    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    console.log('PROYECTO NUEVO: ', docRef.id);
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

  async adicionarProyecto(proyectoId: any, usuarioId: any) {
    const usuarioRef = doc(this.firestore, 'usuarios', usuarioId);
    await updateDoc(usuarioRef, {
      proyectos: arrayUnion(proyectoId)
    });
  }


  // OBTENER ULTIMO NUMERO
  obtenerUltimoNumero() {
    return collectionData<any>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        orderBy('numero', 'desc'), limit(1)
      ), { idField: 'id' }
    );
  }

  // VERIFICAR DUPLICADO
  verificarDuplicado(palabra: any) {
    return collectionData<any>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        where('palabra', '==', palabra)
      ), { idField: 'id' }
    );
  }

  // VERIFICAR DUPLICADO 2
  verificarDuplicado2(palabra: any) {
    return collectionData<any>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        where('palabra', '==', palabra)
      ), { idField: 'id' }
    );
  }

  // https://firebase.google.com/docs/firestore/query-data/queries?hl=es-419#array_membership
  // OBTENER POR USUARIO
  obtenerPorUsuario() {
    const usuarioLogeado = this.auth.obtenerUsuario.uid;
    // console.log('USUARIO LOGEADO: ', this.auth.obtenerUsuario);
    return collectionData<any>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        where('usuarioCreador', '==', usuarioLogeado)
      ), { idField: 'id' }
    );
  }

  // OBTENER POR USUARIO COLABORACION
  obtenerPorUsuarioColaboracion() {
    const usuarioLogeado = this.auth.obtenerUsuario.email;
    return collectionData<any>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        where('Usuarios', 'array-contains', usuarioLogeado)
      ), { idField: 'id' }
    );
  }

  // OBTENER POR USUARIO COLABORACION 2
  obtenerPorUsuarioColaboracion2() {
    const usuarioLogeado = this.auth.obtenerUsuario.email;

    const objetoBuscar = {
      email: "sandro.codigo@gmail.com",
    }

    return collectionData<any>(
      query(
        collection(this.firestore, `${this.url}`) as CollectionReference<any>,
        where('Invitados', 'array-contains', objetoBuscar)
      ), { idField: 'id' }
    );
  }

  async obtenerTodosUnaVez() {
    return await getDocs(collection(this.firestore, `${this.url}`));
  }

  async obtenerTodosUnaVez2() {
    const valores = [];
    const documentos: any = await getDocs(collection(this.firestore, `${this.url}`));
    // console.log('DOC: ', documentos.doc);
    for await (const results of documentos.docs) {

      valores.push(results.data().descripcion)
    }
    return valores;
  }

  async eliminar(ID: any) {
    const documento = doc(this.firestore, `${this.url}`, ID);
    await deleteDoc(documento);
  }

  async obtenerProyectos() {
    const userDocRef = doc(this.firestore, 'usuarios', this.auth.obtenerUsuario.email);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userProjects = userDocSnap.data()['proyectos'];
      const projectsData = [];

      for (const projectId of userProjects) {
        const projectDocRef = doc(this.firestore, 'proyectos', projectId);
        const projectDocSnap = await getDoc(projectDocRef);

        if (projectDocSnap.exists()) {
          projectsData.push(projectDocSnap.data());
        } else {
          console.log('Proyecto no encontrado:', projectId);
        }
      }

      return projectsData; // Devuelve los datos de los proyectos
    } else {
      // console.log('Usuario no encontrado:', userId);
      return null;
    }
  }


  obtenerProyectosDeUsuario(usuarioId: string): Observable<Project[]> {
    // Referencia a la colección de proyectos
    const projectsCollectionRef = collection(this.firestore, `${this.url}`);
    // Crea una consulta que busque en el array 'usuarios' el correo del usuario
    const projectsQuery = query(projectsCollectionRef, where('Usuarios', 'array-contains', usuarioId));
    // Ejecuta la consulta y devuelve un Observable de los proyectos
    return collectionData<Project>(projectsQuery, { idField: 'id' });
  }



  async eliminarProyectoDeUsuario(usuarioId: string, proyectoId: string) {
    const usuarioRef = doc(this.firestore, `${this.url}`, usuarioId);
    await updateDoc(usuarioRef, {
      proyectos: arrayRemove(proyectoId)
    });
  }


  async eliminarProyectoDeTodosLosUsuarios(proyectoId: string) {
    const q = query(collection(this.firestore, `${this.url}`), where("proyectos", "array-contains", proyectoId));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(this.firestore);

    querySnapshot.forEach((document) => {
      const docRef = doc(this.firestore, `${this.url}`, document.id);
      batch.update(docRef, { proyectos: arrayRemove(proyectoId) });
    });

    await batch.commit();
  }


  async eliminarProyecto(proyectoId: string) {
    // Eliminar el proyecto de la coleccion de "proyectos"
    const proyectoRef = doc(this.firestore, 'proyectos', proyectoId);
    await deleteDoc(proyectoRef);

    // Eliminar el ID del proyecto del campo `proyectos` de todos los usuarios
    const q = query(collection(this.firestore, 'usuarios'), where("proyectos", "array-contains", proyectoId));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(this.firestore);

    querySnapshot.forEach((document) => {
      const userRef = doc(this.firestore, 'usuarios', document.id);
      batch.update(userRef, { proyectos: arrayRemove(proyectoId) });
    });

    await batch.commit();
  }


  // OBTENER CONSULTA
  async obtenerConsulta(datos: any): Promise<Usuario2[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Usuario2>;
    /*     let condiciones = [];
    
        // Aplicar condiciones solo si el usuario y el producto no son 'TODOS'
        if (datos.tipo !== 'TODOS') {
          condiciones.push(where('tipo', '==', datos.tipo));
        }
    
        if (datos.publicado !== 'TODOS') {
          const publicadoBoolean = datos.publicado === 'true'; // Asegúrate de que sea booleano
          condiciones.push(where('publicado', '==', publicadoBoolean));
        } */

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('email'),
    ];

    // Combinar condiciones, orden y rango para crear la consulta (...condiciones)
    let q = query(coleccion, ...ordenYRango);

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }


  // OBTENER CONSULTA
  async obtenerConsultaPorTipo(datos: any): Promise<Usuario2[]> {

    let coleccion = collection(this.firestore, `${this.url}`) as CollectionReference<Usuario2>;
    let condiciones = [];

    // Aplicar condiciones solo si el usuario y el producto no son 'TODOS'
    if (datos.adminTipo !== 'TODOS') {
      condiciones.push(where('adminTipo', '==', datos.adminTipo));
    }
    
    /* 
        if (datos.publicado !== 'TODOS') {
          const publicadoBoolean = datos.publicado === 'true'; // Asegúrate de que sea booleano
          condiciones.push(where('publicado', '==', publicadoBoolean));
        } */

    // Orden predeterminado y rango de fechas
    let ordenYRango = [
      orderBy('email'),
    ];

    // Combinar condiciones, orden y rango para crear la consulta (...condiciones)
    let q = query(coleccion, ...condiciones, ...ordenYRango);

    // Ejecutar la consulta y procesar los resultados
    const querySnapshot = await getDocs(q);
    const registros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return registros;
  }


}
