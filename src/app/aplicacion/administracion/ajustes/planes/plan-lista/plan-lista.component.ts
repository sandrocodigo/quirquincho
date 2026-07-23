import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from '../../../../sistema/spinner/spinner.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  getNombreMes(mesNum: number): string {
    const mesesNombres = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return mesesNombres[mesNum - 1] || 'N/A';
  }

  formatearFecha(fechaInput: any): string {
    if (!fechaInput) return 'N/A';
    try {
      let fecha: Date;
      if (typeof fechaInput.toDate === 'function') {
        fecha = fechaInput.toDate();
      } else {
        fecha = new Date(fechaInput);
      }
      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const dd = String(fecha.getDate()).padStart(2, '0');
      const hh = String(fecha.getHours()).padStart(2, '0');
      const min = String(fecha.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch (e) {
      return String(fechaInput);
    }
  }

  descargarRecibo(fila: any) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    // Barra decorativa superior
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 216, 12, 'F');

    // Título de la empresa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('MiAppPRO', 20, 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Software & Ciberseguridad', 20, 36);

    // Título del documento
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('RECIBO DE PAGO', 196, 30, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`ID Plan: ${fila.id || 'N/A'}`, 196, 36, { align: 'right' });

    // Línea divisoria
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, 42, 196, 42);

    // Caja de información del cliente
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text('INFORMACIÓN DEL CLIENTE', 20, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Cliente: Grupo Empresarial Quirquincho', 20, 58);
    doc.text(`Responsable: Arnold Salazar`, 20, 63);

    // Caja de información del pago
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text('DETALLES DEL RECIBO', 120, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`Fecha Emisión: ${new Date().toLocaleDateString()}`, 120, 58);
    doc.text(`Fecha Pago: ${this.formatearFecha(fila.pagadoFechaHora)}`, 120, 63);

    // Badge "PAGADO"
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.roundedRect(120, 68, 35, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('ESTADO: PAGADO', 137.5, 72, { align: 'center' });

    // Tabla de ítems con jspdf-autotable
    autoTable(doc, {
      startY: 85,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      head: [['Concepto / Descripción', 'Gestión', 'Mes', 'Total']],
      body: [
        [
          fila.descripcion || 'Desarrollo y Mantenimiento de Sistema',
          fila.gestion?.toString() || 'N/A',
          this.getNombreMes(fila.mes),
          `Bs. ${fila.monto ? fila.monto.toFixed(2) : '0.00'}`
        ]
      ],
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 26, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });

    // Fila de Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`Total Pagado: Bs. ${fila.monto ? fila.monto.toFixed(2) : '0.00'}`, 196, finalY, { align: 'right' });

    // Notas y validaciones
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Nota: Este comprobante es un documento oficial digital de conformidad de pago.', 20, finalY + 20);

    if (fila.usuarioAprobador) {
      doc.text(`Pago verificado y aprobado por administración de MiAppPRO`, 20, finalY + 25);
    } else if (fila.respuesta && fila.respuesta.id) {
      doc.text(`Transacción PayPal ID: ${fila.respuesta.id}`, 20, finalY + 25);
    }

    // Línea de firma / sello
    const firmaY = finalY + 45;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(130, firmaY, 186, firmaY);
    doc.text('Firma / Sello Autorizado', 158, firmaY + 5, { align: 'center' });

    // Footer
    doc.setDrawColor(241, 245, 249);
    doc.line(20, 262, 196, 262);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('MiAppPRO - Comprobante de Pago Electrónico', 108, 268, { align: 'center' });

    // Guardar PDF
    doc.save(`Recibo_Pago_${fila.gestion}_${fila.mes}.pdf`);
  }
}
