import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
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
export class PaypalComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  @ViewChild('aForm') aForm!: ElementRef;

  id: any;
  plan: any;

  public payPalConfig?: IPayPalConfig;
  showSuccess = false;

  purchaseItems;

  total!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PaypalComponent>,
    private fb: FormBuilder,
    private auth: AuthService,
    private planServicio: PlanService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
  ) {
    this.id = data.id;
    this.plan = data.objeto;
    console.log('DATA: ', data.objeto);

    this.purchaseItems = [
      { name: data.objeto.descripcion, quantity: 1, price: data.objeto.monto },
      // { name: 'Smartphone Dual Camera', quantity: 2, price: 5 },
      // { name: 'Black Colour Smartphone', quantity: 1, price: 10 }
    ];

    this.obtenerTotal();
    this.initConfig();


    /*     if (data.nuevo) { }
        else {
          // FORM EDITAR
          this.cargando.show();
          this.resumenServicio.obtenerPorId(this.id).then((respuesta: any) => {
    
            this.registro = respuesta;
            this.registroFormGroup = this.fb.group({
              descripcion: [respuesta.descripcion, [Validators.required]],
              descontado: [respuesta.descontado],
    
              edicionUsuario: [this.auth.obtenerUsuario.email],
              edicionFecha: [this.fechaHoy]
            });
    
            // this.establecerSuscripcion();
            // this.obtenerVehiculos();
            this.cargando.hide();
            // this.focus();
          });
        } */

  }

  // INICIAR
  ngOnInit() {

  }

  // FOCUS
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

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {
    this.r.empresa.valueChanges.subscribe((val: any) => {
      //this.obtenerVehiculos();
    });
  }

  obtenerTotal(): void {
    this.total = this.purchaseItems.map(x => x.quantity * x.price).reduce((a, b) => a + b, 0).toString();
  }

  // https://enngage.github.io/ngx-paypal/
  private initConfig(): void {
    // this.total = this.purchaseItems.map(x => x.quantity * x.price).reduce((a, b) => a + b, 0).toString();
    const currency = 'USD';

    this.payPalConfig = {
      currency: currency,
      clientId: 'AZ9cUSAPryyR7KSDuecyPsq-YXtHFNjvZdYlJVtgQl-kj-87urViPwGPiZZUq_dGQoCS8AKG2rog9HPl', // PRODUCCION
      // clientId: 'AciFqYI3TLWV_6EySNITjh2rzelgS5rHp970ApIE9sg1YiSlCcyhKoMwiT3UX3k4rTHg1KxyMqGu4v_l', // DESARROLLO

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
            items: this.purchaseItems.map(x => <ITransactionItem>
              {
                name: x.name,
                quantity: x.quantity.toString(),
                category: 'DIGITAL_GOODS',
                unit_amount: {
                  currency_code: currency,
                  value: x.price.toString(),
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
          this.snackbar.open('Pagado con exito, muchas gracias...', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        });

      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: err => {
        console.log('OnError', err);
        this.snackbar.open('Ocurro un error al hacer la transaccion', 'OK', { duration: 10000 });
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      },
    };
  }


  // REGISTRAR
  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Se requerie datos...', 'OK', {
        duration: 3000
      });
      return;
    } else {
      if (this.data.nuevo) {
        this.cargando.show();
        this.planServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, Vehiculo creado con exito...', 'OK', {
            duration: 10000
          });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      } else {
        this.cargando.show();
        this.planServicio.editar(this.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, actualizado con exito...', 'OK', {
            duration: 10000
          });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }

    }
  }
}
