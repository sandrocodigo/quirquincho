import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../servicios/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ArchivoSeleccionarComponent } from '../../archivos/archivo-seleccionar/archivo-seleccionar.component';
import { AsignacionFormComponent } from '../asignacion-form/asignacion-form.component';
import { AsignacionContenidoComponent } from '../asignacion-contenido/asignacion-contenido.component';
import { AsignacionService } from '../../../servicios/asignacion.service';


@Component({
  selector: 'app-asignacion-detalle',
  templateUrl: './asignacion-detalle.component.html',
  styleUrl: './asignacion-detalle.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule,

    // MATERIAL
    MatIconModule,
    MatButtonModule,
  ],
})
export class AsignacionDetalleComponent {

  idAsignacion: any;
  asignacion: any;

  fotos: any[] = [];
  fotoSeleccionado: any = null;

  @ViewChild('tabla') tabla!: ElementRef;

  hoy = new Date();

  constructor(
    private ruta: ActivatedRoute,
    private auth: AuthService,
    private asignacionServicio: AsignacionService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    public router: Router,
    private sanitizer: DomSanitizer) {
    this.idAsignacion = this.ruta.snapshot.paramMap.get('id');

    //console.log('PROYECTO: ', this.idProyecto);
    //console.log('MATRIZ: ', this.idMatriz);
  }

  ngOnInit() {
    this.obtenerProducto();
  }

  obtenerProducto() {
    this.cargando.show();
    this.asignacionServicio.obtenerPorId(this.idAsignacion).then((res: any) => {
      this.asignacion = res;

      this.fotos = Array.isArray(res?.fotosUrl) ? res.fotosUrl : [];

      if (this.fotos && this.fotos.length > 0) {
        this.fotoSeleccionado = this.fotos[0];
      }

      this.cargando.hide();
    });
  }

  editar() {
    const dialogRef = this.dialog.open(AsignacionFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: this.idAsignacion,
        objeto: this.asignacion,
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
    const dialogRef = this.dialog.open(AsignacionContenidoComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: this.idAsignacion,
        objeto: this.asignacion,
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerProducto();
      }
    });
  }

  /*   cargarFotos() {
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
    } */


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
        this.asignacionServicio.editar(this.idAsignacion, { actaDigital: result.url }).then(result => {
          this.snackbar.open('Hey!, Documento cargado...', 'OK', { duration: 10000 });
          this.obtenerProducto();
        })
      }
    });
  }

  // Método para sanitizar HTML
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }


  imprimir() {
    const printContents = this.tabla.nativeElement.outerHTML;
    const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');

    if (!popupWin) return;

    popupWin.document.open();
    popupWin.document.write(`
        <html>
          <head>
            <title>Egreso de productos</title>
            <style>
              body {
                font-family: 'Courier New', Courier, monospace;
                width: 200mm;
                margin: 0;
                padding: 10px;
                font-size: 14px;
              }
              .ticket-header {
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
                border-bottom: 1px dashed black;
                padding-bottom: 5px;
              }
              .ticket-info {
                font-size: 14px;
                margin-bottom: 4px;
              }
              .ticket-info .info-row {
                display: flex;
                justify-content: space-between;
                margin: 2px 0;
              }
              .ticket-body table {
                width: 100%;
                border-collapse: collapse;
              }
              .ticket-body th,
              .ticket-body td {
                text-align: left;
                padding: 4px 5px;
                font-size: 15px;
              }
              .ticket-body th {
                font-weight: bold;
                border-bottom: 1px solid black;
              }
              .ticket-footer {
                margin-top: 10px;
                text-align: right;
                font-size: 18px;
                font-weight: bold;
                border-top: 1px dashed black;
                padding-top: 5px;
              }
            </style>
          </head>
          <body onload="window.print();window.close()">
            ${printContents}
          </body>
        </html>
      `);
    popupWin.document.close();

    // Verificamos si se cierra
    const interval = setInterval(() => {
      if (popupWin.closed) {
        clearInterval(interval); // Dejamos de verificar
        // this.dialogRef.close(true); // Tu método a ejecutar
      }
    }, 500); // Verifica cada 0.5 segundos
  }
}
