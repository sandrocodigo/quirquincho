import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class PlanListaComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);
  private cargando = inject(SpinnerService);
  private planServicio = inject(PlanService);
  private authServicio = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private destroyRef = inject(DestroyRef);

  displayedColumns: string[] = ['gestion', 'mes', 'monto', 'fechaLimite', 'descripcion', 'pagado', 'vencido', 'opciones'];
  dataSource = new MatTableDataSource<any>([]);
  ingreso: any;
  lista: any;

  listaPendientes: any;

  fecha = new Date().toISOString().split('T')[0];

  usuario = toSignal(this.authServicio.user$, { initialValue: null });
  usuarioDatos = signal<any>(null);

  constructor() {
    this.authServicio.user$
      .pipe(takeUntilDestroyed())
      .subscribe((user) => {
        if (user?.email) {
          console.log('USUARIO ID: ', user.email);
          this.usuarioService.obtenerPorId(user.email).then(res => {
            this.usuarioDatos.set(res);
            console.log('USUARIO DATOS: ', res);
          });
        }
      });
  }

  ngOnInit(): void {
    this.verificarPago();
    this.obtener();
  }

  verificarPago() {
    this.planServicio.verificarPagosPendientes().then((res) => {
      console.log('VERIFICACION DE PAGO: ', res);
      this.listaPendientes = res;
    });
  }

  obtener() {
    this.cargando.show();
    this.planServicio.obtenerTodos().then((respuesta: any) => {
      this.dataSource.data = respuesta || [];
      this.lista = respuesta;
      this.cargando.hide();
      this.verificarPago();
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
          this.obtener();
        })
      }
    });
  }

  async crearPlanes() {
    const fechaInicio = new Date(2023, 0, 1);
    const fechaFinal = new Date(2024, 11, 31);

    let fechaActual = new Date(fechaInicio);

    while (fechaActual <= fechaFinal) {
      const datosPlan = {
        gestion: fechaActual.getFullYear(),
        mes: fechaActual.getMonth() + 1,
        fechaInicio: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString(),
        fechaFinal: new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).toISOString(),
        fechaLimite: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 10).toISOString(),
        pagado: false,
        monto: 25.00,
        usuarioId: 'usuarioEjemplo',
        notes: `Plan para ${fechaActual.getMonth() + 1}/${fechaActual.getFullYear()}`,
        estado: 'pendiente'
      };

      await this.planServicio.crear(datosPlan);
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
      monto: 50.00,
      usuarioId: 'usuarioEjemplo',
      notas: `Gestion de creditos`,
      estado: 'pendiente',
    };

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
      this.obtener();
    })
  }

  esVencido(fila: any): boolean {
    if (fila.pagado) {
      return false;
    }
    let limite: Date;
    if (fila.fechaLimite) {
      if (typeof fila.fechaLimite.toDate === 'function') {
        limite = fila.fechaLimite.toDate();
      } else {
        limite = new Date(fila.fechaLimite);
      }
    } else {
      return false;
    }
    const hoy = new Date();
    limite.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    return hoy > limite;
  }

  esFuturo(fila: any): boolean {
    if (fila.pagado) {
      return false;
    }
    const hoy = new Date();
    const gestionPlan = fila.gestion || 0;
    const mesPlan = fila.mes || 0;
    
    const gestionActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1; // 1-indexed
    
    if (gestionPlan > gestionActual) {
      return true;
    }
    if (gestionPlan === gestionActual && mesPlan > mesActual) {
      return true;
    }
    return false;
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
            usuarioAprobador: this.usuario()?.email
          }).then(() => {
            this.cargando.hide();
            this.snackbar.open('Pago Aprobado...', 'OK', { duration: 10000 });
            this.obtener();
          })
      }
    });
  }
}
