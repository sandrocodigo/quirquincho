import {
  Auth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { getAuth } from "firebase/auth";

import { Injectable } from '@angular/core';
import { Login } from '../modelos/login';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  public user$: Observable<any | null>;

  constructor(private auth: Auth) {
    this.user$ = new Observable((observer) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          observer.next(user);
        } else {
          observer.next(null);
        }
      });
    });
  }

  crear({ email, password }: Login) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login({ email, password }: Login) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  resetPassword(datos: any) {
    return sendPasswordResetEmail(this.auth, datos.email);
  }

  logout() {
    return signOut(this.auth);
  }

  getCurrentUserEmail(): any {
    const savedAuthState = localStorage.getItem('usuarioEmail');
    return savedAuthState;
  }

  // OBTENER USUARIO 
  get obtenerUsuario(): any {
    const auth = getAuth();
    return auth.currentUser;
  }

}