import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from '../../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PaypalComponent } from '../paypal/paypal.component';
import { PlanFormComponent } from '../plan-form/plan-form.component';
import { PlanSubirComponent } from '../plan-subir/plan-subir.component';
import { PlanService } from '../../../../servicios/plan.service';
import { AuthService } from '../../../../servicios/auth.service';
import { ConfirmacionComponent } from '../../../../sistema/confirmacion/confirmacion.component';
import { UsuarioService } from '../../../../servicios/usuario.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-plan-lista',
  templateUrl: './plan-lista.component.html',
  styleUrls: ['./plan-lista.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatTooltip
  ],
})
export class PlanListaComponent {

  displayedColumns: string[] = ['gestion', 'mes', 'monto', 'fechaLimite', 'descripcion', 'pagado', 'opciones'];
  dataSource: any;
  ingreso: any;
  lista: any;

  listaPendientes: any;

  fecha = new Date().toISOString().split('T')[0];

  usuario: any | null = null;
  usuarioDatos: any;
  // private suscripcionLista!: Subscription

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private planServicio: PlanService,
    private authServicio: AuthService,
    private usuarioServicio: UsuarioService
  ) {
    this.authServicio.user$.subscribe((user) => {
      this.usuario = user;
      console.log('USUARIO ID: ', this.usuario.email);

      this.usuarioServicio.obtenerPorId(this.usuario.email).then(res => {
        this.usuarioDatos = res;
        console.log('USUARIO DATOS: ', this.usuarioDatos);
      })

    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      //this.buscar();
      this.verificarPago();
      this.obtener();
    }, 0);
  }

  /*  
buscar(): void {
    this.cargando.show();
    this.suscripcionLista = this.planServicio.obtenerTodosTR().subscribe((respuesta: any) => {
      // console.log('PLANES: ', JSON.stringify(respuesta, null, 2));

      // console.log('PLANES: ', JSON.stringify(respuesta, null, 2));

      this.dataSource = new MatTableDataSource(respuesta);
      this.lista = respuesta;
      this.cargando.hide();
    });
  } */

  verificarPago() {
    this.planServicio.verificarPagosPendientes().then((res) => {
      console.log('VERIFICACION DE PAGO: ', res);
      this.listaPendientes = res;
    });
  }

  obtener() {
    this.cargando.show();
    this.planServicio.obtenerTodos().then((respuesta: any) => {
      // console.log('PLANES: ', JSON.stringify(respuesta, null, 2));

      // console.log('PLANES: ', JSON.stringify(respuesta, null, 2));

      this.dataSource = new MatTableDataSource(respuesta);
      this.lista = respuesta;
      this.cargando.hide();
    });
  }

  nuevo() {
    const dialogRef = this.dialog.open(PlanFormComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
        objeto: null
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtener();
      }
    });
  }

  editar(fila: any) {
    const dialogRef = this.dialog.open(PlanFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: fila.id,
        objeto: fila
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtener();
      }
    });
  }


  /* 
    nuevo() {
      const dialogRef = this.dialog.open(UsuarioFormComponent, {
        width: '600px',
        data: {
          nuevo: true,
          id: null,
          objeto: null
        },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.buscar();
        }
      });
    }
  */

  paypal(fila: any) {
    const dialogRef = this.dialog.open(PaypalComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: fila.id,
        objeto: fila
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
this.obtener();
      }
    });
  }

  subir(fila: any) {
    const dialogRef = this.dialog.open(PlanSubirComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: fila.id,
        objeto: fila
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
this.obtener();
      }
    });
  }

  eliminar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar',
        mensaje: 'Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.planServicio.eliminar(fila.id).then(result => {
          this.cargando.hide();
          this.snackbar.open('Eliminado...', 'OK', {
            duration: 10000
          });
        })
      }
    });
  }

  async crearPlanes() {
    // Fecha de inicio y fin
    const fechaInicio = new Date(2023, 0, 1); // 1 de enero de 2023
    const fechaFinal = new Date(2024, 11, 31); // 31 de diciembre de 2024

    let fechaActual = new Date(fechaInicio);

    while (fechaActual <= fechaFinal) {
      // Crear un nuevo plan para el mes actual
      const datosPlan = {
        gestion: fechaActual.getFullYear(),
        mes: fechaActual.getMonth() + 1,
        fechaInicio: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString(),
        fechaFinal: new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).toISOString(),
        fechaLimite: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 10).toISOString(),
        pagado: false,
        monto: 25.00, // Establecer un monto predeterminado o calcular según sea necesario
        usuarioId: 'usuarioEjemplo', // Cambiar según sea necesario
        notas: `Plan para ${fechaActual.getMonth() + 1}/${fechaActual.getFullYear()}`,
        estado: 'pendiente'
      };

      // Llamar a la función de creación del servicio
      await this.planServicio.crear(datosPlan).then(() => {

      });

      // Avanzar al próximo mes
      fechaActual.setMonth(fechaActual.getMonth() + 1);
    }
  }

  crearPlan() {
    const datosPlan = {
      gestion: 2024,
      mes: 10,
      fechaInicio: '2024-10-01',
      fechaFinal: '2024-10-31',
      fechaLimite: '2024-10-31',
      pagado: false,
      monto: 50.00, // Establecer un monto predeterminado o calcular según sea necesario
      usuarioId: 'usuarioEjemplo', // Cambiar según sea necesario
      notas: `Gestion de creditos`,
      estado: 'pendiente',
    };

    // Llamar a la función de creación del servicio
    this.cargando.show();
    this.planServicio.crear(datosPlan).then(() => {
      this.cargando.hide();

    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  cambiarMonto(fila: any) {
    this.planServicio.editar(fila.id, { pagado: false, pagadoFechaHora: null, }).then(() => {

    })
  }

  aprobar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Aprobar Pago',
        mensaje: 'Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.planServicio.editar(fila.id,
          {
            pagado: true,
            pagadoFechaHora: new Date(),
            usuarioAprobador: this.usuario.email
          }).then(() => {
            this.cargando.hide();
            this.snackbar.open('Pago Aprobado...', 'OK', { duration: 10000 });
          })
          this.obtener();
      }
    });
  }

/*   ngOnDestroy() {
    this.suscripcionLista.unsubscribe();
  } */
}
