import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../servicios/auth.service';
import { ProductoService } from '../../../servicios/producto.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductoFormComponent } from '../producto-form/producto-form.component';
import { ProductoFotosComponent } from '../producto-fotos/producto-fotos.component';
import { ProductoEditorComponent } from '../producto-editor/producto-editor.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ArchivoSeleccionarComponent } from '../../archivos/archivo-seleccionar/archivo-seleccionar.component';

@Component({
  selector: 'app-producto-detalle',
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule,

    // MATERIAL
    MatIconModule,
    MatButtonModule,
  ],
})
export class ProductoDetalleComponent {

  idProducto: any;
  producto: any;

  fotos: any[] = [];
  fotoSeleccionado: any = null;

  constructor(
    private ruta: ActivatedRoute,
    private auth: AuthService,
    private pServicio: ProductoService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    public router: Router,
    private sanitizer: DomSanitizer) {
    this.idProducto = this.ruta.snapshot.paramMap.get('id');

    //console.log('PROYECTO: ', this.idProyecto);
    //console.log('MATRIZ: ', this.idMatriz);
  }

  ngOnInit() {
    this.obtenerProducto();
  }

  obtenerProducto() {
    this.cargando.show();
    this.pServicio.obtenerPorId(this.idProducto).then((res: any) => {
      this.producto = res;
      console.log('PRODUCTO: ', this.producto);

      this.fotos = Array.isArray(res?.fotosUrl) ? res.fotosUrl : [];

      if (this.fotos && this.fotos.length > 0) {
        this.fotoSeleccionado = this.fotos[0];
      }

      this.cargando.hide();
    });
  }

  editar() {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: this.idProducto,
        objeto: this.producto,
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerProducto();
      }
    });
  }

  editor() {
    const dialogRef = this.dialog.open(ProductoEditorComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: this.idProducto,
        objeto: this.producto,
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerProducto();
      }
    });
  }

  cargarFotos() {
    const dialogRef = this.dialog.open(ProductoFotosComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: this.idProducto,
        objeto: this.producto
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerProducto();
      }
    });
  }


  seleccionarImagen(item: any): void {
    this.fotoSeleccionado = item;
  }

  // SELECCIONAR ARCHIVO
  seleccionarArchivo(): void {
    const dialogRef = this.dialog.open(ArchivoSeleccionarComponent, {
      width: '80%',
      data: {
        nuevo: true,
        objeto: null,
        clase: 'TODOS'
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('ARCHIVO SELECCIONADO: ', result);
      if (result) {
        this.pServicio.editar(this.idProducto, { fichaTecnica: result.url }).then(result => { 
          this.snackbar.open('Hey!, Ficha Tecnica cargada...', 'OK', { duration: 10000 });
          this.obtenerProducto();
        })
      }
    });
  }

  // Método para sanitizar HTML
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
