import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../../../servicios/cliente.service';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ProveedorService } from '../../../servicios/proveedor.service';
import { ProveedorFormComponent } from '../proveedor-form/proveedor-form.component';

@Component({
  selector: 'app-proveedor-lista',
  templateUrl: './proveedor-lista.component.html',
  styleUrl: './proveedor-lista.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    // MATERIAL
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatDividerModule,
    MatDialogModule,
    MatTableModule
  ],
})
export class ProveedorListaComponent {

  displayedColumns: string[] = ['empresa', 'opciones'];
  dataSource: any;

  constructor(
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private titleService: Title,
    private cargando: SpinnerService,
    private proveedorServicio: ProveedorService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Proveedores');
    this.listar();

  }

  listar() {
    this.cargando.show();
    this.proveedorServicio.obtenerTodos().subscribe((res: any) => {
      console.log('LISTA: ', res);
      this.dataSource = new MatTableDataSource(res);
      this.cargando.hide();
    });
  }

  // NUEVO
  nuevo(): void {
    const dialogRef = this.dialog.open(ProveedorFormComponent, {
      width: '80%',
      data: {
        nuevo: true,
        objeto: null
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.listar();
      if (result) {
        // this.obtener();
      }
    });
  }

  // EDIATR
  editar(fila: any): void {
    const dialogRef = this.dialog.open(ProveedorFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        objeto: fila,
        id: fila.id
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // this.listar();
        // this.router.navigate(['/proyectos/lista']);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
