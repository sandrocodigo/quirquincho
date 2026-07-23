import { Component, ElementRef, OnInit, signal, inject, DestroyRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../../sistema/spinner/spinner.service';

// PAYPAL
import { IPayPalConfig, ICreateOrderRequest, ITransactionItem, NgxPayPalModule } from 'ngx-paypal';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { PlanService } from '../../../../servicios/plan.service';
import { AuthService } from '../../../../servicios/auth.service';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrl: './paypal.component.scss',
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
    MatSlideToggleModule,
    NgxPayPalModule
  ],
})
export class PaypalComponent implements OnInit {
  public data = inject<any>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<PaypalComponent>);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private planServicio = inject(PlanService);
  private snackbar = inject(MatSnackBar);
  public dialog = inject(MatDialog);
  private cargando = inject(SpinnerService);
  private destroyRef = inject(DestroyRef);

  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  @ViewChild('aForm') aForm!: ElementRef;

  id: any;
  plan: any;

  public payPalConfig?: IPayPalConfig;
  showSuccess = false;

  purchaseItems: any[] = [];
  total!: string;

  usuario = toSignal(this.auth.user$, { initialValue: null });

  ngOnInit() {
    this.id = this.data.id;
    this.plan = this.data.objeto;
    console.log('DATA: ', this.data.objeto);

    this.purchaseItems = [
      { name: `${this.plan.descripcion} (Incl. Comisiones PayPal)`, quantity: 1, price: 40.00 },
    ];

    this.obtenerTotal();
    this.initConfig();
  }

  focus(): void {
    setTimeout(() => {
      const input = 'precio';
      const ele = this.aForm.nativeElement[input];
      if (ele) {
        ele.focus();
        ele.select();
      }
    }, 100);
  }

  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {}

  obtenerTotal(): void {
    const totalNum = this.purchaseItems.map(x => x.quantity * x.price).reduce((a, b) => a + b, 0);
    this.total = totalNum.toFixed(2);
  }

  private initConfig(): void {
    const currency = 'USD';

    this.payPalConfig = {
      currency: currency,
      clientId: 'AZ9cUSAPryyR7KSDuecyPsq-YXtHFNjvZdYlJVtgQl-kj-87urViPwGPiZZUq_dGQoCS8AKG2rog9HPl', // PRODUCCION

      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: this.total,
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: this.total
                }
              }
            },
            items: this.purchaseItems.map(x => <ITransactionItem>{
              name: x.name,
              quantity: x.quantity.toString(),
              category: 'DIGITAL_GOODS',
              unit_amount: {
                currency_code: currency,
                value: x.price.toFixed(2),
              },
            })
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        console.log('onApprove: la transacción fue aprobada, pero no autorizada: ', data, actions);
        actions.order.get().then((details: any) => {
          console.log('onApprove - Puede obtener los detalles completos del pedido en : ', details);
        });
      },
      onClientAuthorization: (data) => {
        console.log('onClientAuthorization - probablemente deberías informar a tu servidor sobre la transacción completada en este punto', data);

        this.planServicio.editar(this.plan.id, {
          pagado: true,
          pagadoFechaHora: this.fechaHoy,
          respuesta: data
        }).then(res => {
          this.snackbar.open('Pagado con éxito. Por favor, comuníquese con el administrador para confirmar el pago.', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
        });
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: err => {
        console.log('OnError', err);
        this.snackbar.open('Ocurrió un error al hacer la transacción', 'OK', { duration: 10000 });
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      },
    };
  }

  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Se requieren datos...', 'OK', {
        duration: 3000
      });
      return;
    } else {
      this.cargando.show();
      this.planServicio.editar(this.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
        this.snackbar.open('Actualizado con éxito...', 'OK', {
          duration: 10000
        });
        this.dialogRef.close(true);
        this.cargando.hide();
      });
    }
  }
}
