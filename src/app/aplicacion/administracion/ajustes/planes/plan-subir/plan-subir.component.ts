import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';



import { getDownloadURL, getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { AuthService } from '../../../../servicios/auth.service';
import { PlanService } from '../../../../servicios/plan.service';


@Component({
  selector: 'app-plan-subir',
  templateUrl: './plan-subir.component.html',
  styleUrl: './plan-subir.component.scss',
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
    MatSlideToggleModule
  ],
})
export class PlanSubirComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  usuario: any | null = null;
  selectedFile: File | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PlanSubirComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private planServicio: PlanService,
    public authServicio: AuthService,
  ) {

    this.authServicio.user$.subscribe((user) => {
      this.usuario = user;

      // FORM EDITAR
      this.cargando.show();
      this.planServicio.obtenerPorId(data.objeto.id).then((respuesta: any) => {
        console.log('PLAN: ', respuesta);
        this.registroFormGroup = this.fb.group({

          comprobante: [respuesta.comprobante],
          comprobanteDescripcion: [respuesta.comprobanteDescripcion, [Validators.required]],

          usuarioSubido: [this.usuario.email],
          fechaSubido: [this.fechaHoy]
        });
        this.establecerSuscripcion();
        this.cargando.hide();
      });

    });
  }

  // INICIAR
  ngOnInit() {

  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {
    /*     this.r.gestion.valueChanges.subscribe((val: any) => {
          this.cargarFechas();
        });
        this.r.mes.valueChanges.subscribe((val: any) => {
          console.log(val);
          this.cargarFechas();
        }); */

  }

  // Manejo del archivo seleccionado
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid || !this.selectedFile) {
      this.snackbar.open('Se requiere llenar todos los datos y seleccionar un archivo...', 'OK', {
        duration: 10000
      });
      return;
    } else {
      this.cargando.show();

      // Subir archivo a Firebase Storage
      const storage = getStorage();
      const filePath = `comprobantes/${this.selectedFile.name}`; // Ruta del archivo en Firebase Storage
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, this.selectedFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Progreso de subida: ', progress);
        },
        (error) => {
          console.error('Error al subir el archivo: ', error);
          this.cargando.hide();
        },
        () => {
          // Obtener la URL del archivo subido
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // Actualizar el campo 'comprobante' con la URL del archivo subido
            const updatedData = {
              ...this.registroFormGroup.getRawValue(),
              comprobante: downloadURL
            };

            // Actualizar el registro en Firestore
            this.planServicio.editar(this.data.objeto.id, updatedData).then(() => {
              this.snackbar.open('Comprobante subido y registro actualizado con éxito...', 'OK', { duration: 10000 });
              this.dialogRef.close(true);
              this.cargando.hide();
            }).catch(error => {
              console.error('Error al actualizar el registro: ', error);
              this.cargando.hide();
            });
          });
        }
      );
    }
  }
}
