import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Firestore, collectionData, collection, addDoc, doc, setDoc, getDoc, updateDoc,
  orderBy, onSnapshot, query, where, getDocs, CollectionReference
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private url = 'mail';

  constructor(private firestore: Firestore, private auth: AuthService) { }

  // CREAR
  async crear(datos: any) {
    const docRef = await addDoc(collection(this.firestore, `${this.url}`), datos);
    return docRef;
  }

}
