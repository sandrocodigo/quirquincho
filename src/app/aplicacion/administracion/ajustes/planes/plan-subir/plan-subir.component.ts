import { Component, Inject, OnInit, signal, inject, DestroyRef } from '@angular/core';
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
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class PlanSubirComponent implements OnInit {
  public data = inject<any>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<PlanSubirComponent>);
  private fb = inject(FormBuilder);
  private snackbar = inject(MatSnackBar);
  public dialog = inject(MatDialog);
  private cargando = inject(SpinnerService);
  private planServicio = inject(PlanService);
  public authServicio = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  usuario = toSignal(this.authServicio.user$, { initialValue: null });
  selectedFile: File | null = null;

  ngOnInit() {
    this.authServicio.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        if (user?.email) {
          this.cargando.show();
          this.planServicio.obtenerPorId(this.data.objeto.id).then((respuesta: any) => {
            console.log('PLAN: ', respuesta);
            this.registroFormGroup = this.fb.group({
              comprobante: [respuesta.comprobante],
              comprobanteDescripcion: [respuesta.comprobanteDescripcion, [Validators.required]],
              usuarioSubido: [user.email],
              fechaSubido: [this.fechaHoy]
            });
            this.establecerSuscripcion();
            this.cargando.hide();
          });
        }
      });
  }

  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {}

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

      const storage = getStorage();
      const filePath = `comprobantes/${this.selectedFile.name}`;
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
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const updatedData = {
              ...this.registroFormGroup.getRawValue(),
              comprobante: downloadURL
            };

            this.planServicio.editar(this.data.objeto.id, updatedData).then(() => {
              this.snackbar.open('Comprobante subido con éxito. Por favor, comuníquese con el administrador para confirmar el pago.', 'OK', { duration: 10000 });
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
