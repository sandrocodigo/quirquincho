import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '../servicios/auth.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { UsuarioService } from '../servicios/usuario.service';
import { filter } from 'rxjs';


@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,
    MatIconModule, MatButtonModule, MatDividerModule, MatSlideToggleModule, MatMenuModule,],
})
export class AdministracionComponent {
  usuario = signal<any | null>(null);
  usuarioDato = signal<any>(null);
  darkMode = signal<boolean>(false);
  menuOpen = signal<boolean>(false);
  foto = signal<string>('imagenes/avatar.png');
  visitas = signal<number>(0);

  /*   menuItems = [
      { link: 'estadisticas', icon: 'bar_chart', label: 'Estadisticas', color: 'text-blue-500' },
      { link: '/administracion/productos', icon: 'solar_power', label: 'Productos', color: 'text-blue-500' },
      { link: 'clientes', icon: 'people', label: 'Clientes', color: 'text-blue-500' },
      { link: 'proveedores', icon: 'engineering', label: 'Proveedores', color: 'text-blue-500' },
      // { link: 'cotizaciones', icon: 'file_open', label: 'Cotizaciones', color: 'text-blue-700' },
      { link: 'ingresos', icon: 'add_box', label: 'Ingresos', color: 'text-blue-500' },
      { link: 'egresos', icon: 'indeterminate_check_box', label: 'Egresos', color: 'text-blue-500' },
      { link: 'caja', icon: 'currency_exchange', label: 'Caja', color: 'text-blue-500' },
      // { link: 'proyectos', icon: 'home_work', label: 'Proyectos', color: 'text-blue-700' },
      { link: 'reportes', icon: 'summarize', label: 'Reportes', color: 'text-blue-500' },
      { link: 'archivos', icon: 'folder', label: 'Archivos', color: 'text-blue-500' }
    ]; */


  menuItems: any = [];
  menuItemsTodos: any = [];

  colorTheme: 'theme-orange' | 'theme-cyan' | 'theme-violet' | 'theme-magenta' | 'theme-chartreuse' | 'theme-rose' = 'theme-orange';
  listaTemas = [
    { "id": "theme-orange", "label": "Orange", "preview": "#fb923c" },
    { "id": "theme-cyan", "label": "Cyan", "preview": "#06b6d4" },
    { "id": "theme-violet", "label": "Violet", "preview": "#8b5cf6" },
    { "id": "theme-magenta", "label": "Magenta", "preview": "#db2777" },
    { "id": "theme-chartreuse", "label": "Chartreuse", "preview": "#84cc16" },
    { "id": "theme-rose", "label": "Rose", "preview": "#f43f5e" }
  ];

  constructor(
    private authServicio: AuthService,
    public router: Router,
    private usuarioService: UsuarioService,
    private overlayContainer: OverlayContainer) {

    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario.set(user);
        this.foto.set(user.photoURL ? user.photoURL : 'imagenes/avatar.png');

        this.usuarioService.obtenerPorId(user.email).then((respuesta: any) => {

          // console.log('USUARIO ACCESOS', respuesta.accesos);

          // const items = this.buscarEnLaListaMuchos(respuesta.accesos, 'nav', true) || [];

          // console.log('SOLO PARA MENU', items);

          this.usuarioDato.set(respuesta);
          this.menuItems = this.buscarEnLaListaMuchos(respuesta.accesos, 'nav', true) || [];
          this.menuItemsTodos = respuesta.accesos || [];

        });
        // console.log('USUARIO: ', this.usuario);
        // console.log('USUARIO FOTO: ', this.foto);
      }
    });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.closeMenuAfterNavigation());
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
    this.darkMode.set(storedTheme ? storedTheme === 'dark' : true);
    this.colorTheme = storedColor || 'theme-orange';
  }

  applyDarkMode() {
    this.syncThemeClasses();
  }

  toggleDarkMode(event?: MatSlideToggleChange) {
    if (event) {
      this.darkMode.set(event.checked);
    } else {
      this.darkMode.set(!this.darkMode());
    }
    localStorage.setItem('theme', this.darkMode() ? 'dark' : 'light');
    this.applyDarkMode();
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  recargarPagina() {
    window.location.reload();
  }

  cambiarPaleta(theme: any) {
    this.setColorTheme(theme);
  }

  closeMenuAfterNavigation() {
    if (this.isMobileView()) {
      this.menuOpen.set(false);
    }
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
    if (this.darkMode()) { body.classList.add(darkClass); host.classList.add(darkClass); }
    else { body.classList.remove(darkClass); host.classList.remove(darkClass); }
  }

  setColorTheme(theme: any) {
    this.colorTheme = theme;
    localStorage.setItem('colorTheme', theme);
    this.syncThemeClasses();
  }

  isActive(id: string) {
    return this.colorTheme === id;
  }

  private isMobileView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }
}
