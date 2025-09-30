import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

// MATERIAL
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../servicios/auth.service';
import { MatDialog } from '@angular/material/dialog';

import { OverlayContainer } from '@angular/cdk/overlay';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { UsuarioService } from '../servicios/usuario.service';

@Component({
  selector: 'app-sitio',
  templateUrl: './sitio.component.html',
  styleUrl: './sitio.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatMenuModule
  ],
})
export class SitioComponent {
  // menu = menu;
  usuario: any | null = null;
  usuarioDatos: any;

  foto = 'imagenes/avatar.png';

  darkMode = false;
  menuOpen = false;

  visitas: number | null = null;

  menuItems = [
    { link: 'inicio', icon: 'home', label: 'Inicio', color: 'text-green-700' },
    { link: 'contacto', icon: 'phone', label: 'Contacto', color: 'text-green-500' },
    /*     { link: 'viajes', icon: 'car_rental', label: 'Viajes', color: 'text-red-600' },
         */
  ];

  menuItemsTodos: any = [];

  colorTheme: 'theme-orange' | 'theme-cyan' | 'theme-violet' | 'theme-magenta' | 'theme-chartreuse' | 'theme-rose' = 'theme-orange';

  constructor(
    private dialog: MatDialog,
    private overlayContainer: OverlayContainer,
    private authServicio: AuthService,
    private usuarioServicio: UsuarioService,
    public router: Router) {
    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;
        this.foto = user.photoURL ? user.photoURL : 'imagenes/avatar.png';
        // console.log('USUARIO: ', this.usuario);

        this.usuarioServicio.obtenerPorId(this.usuario.email).then((res: any) => {
          this.usuarioDatos = res;
        });

        // console.log('USUARIO FOTO: ', this.foto);
      }
    });
  }

ngOnInit(): void {
    this.loadTheme();
    this.applyDarkMode();
  }

  salir() {
    this.authServicio
      .logout()
      .then(() => {
        localStorage.removeItem('usuarioEmail');
        localStorage.removeItem('usuarioAdmin');
        this.router.navigate(['/'])
      }
      )
      .catch((e) => console.log(e.message));
  }

  loadTheme() {
    const storedTheme = localStorage.getItem('theme');
    const storedColor = localStorage.getItem('colorTheme') as any;
    this.darkMode = storedTheme ? storedTheme === 'dark' : true;
    this.colorTheme = storedColor || 'theme-orange';
  }

  applyDarkMode() {
    this.syncThemeClasses();
  }

  toggleDarkMode(event: MatSlideToggleChange) {
    this.darkMode = event.checked;
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
    this.applyDarkMode();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  buscarEnLaListaMuchos<T>(list: T[], key: keyof T, value: any): T[] {
    return list.filter(item => item[key] === value);
  }

  private syncThemeClasses() {
    const body = document.body;
    const host = this.overlayContainer.getContainerElement();

    // Quita cualquier theme-* anterior
    body.classList.remove('theme-orange', 'theme-cyan', 'theme-violet', 'theme-magenta', 'theme-chartreuse', 'theme-rose');
    host.classList.remove('theme-orange', 'theme-cyan', 'theme-violet', 'theme-magenta', 'theme-chartreuse', 'theme-rose');

    // Añade el actual
    body.classList.add(this.colorTheme);
    host.classList.add(this.colorTheme);

    // (Tú ya sincronizas 'dark' aquí)
    const darkClass = 'dark';
    if (this.darkMode) { body.classList.add(darkClass); host.classList.add(darkClass); }
    else { body.classList.remove(darkClass); host.classList.remove(darkClass); }
  }

  setColorTheme(theme: 'theme-orange' | 'theme-cyan' | 'theme-violet' | 'theme-magenta' | 'theme-chartreuse' | 'theme-rose') {
    this.colorTheme = theme;
    localStorage.setItem('colorTheme', theme);
    this.syncThemeClasses();
  }

}
