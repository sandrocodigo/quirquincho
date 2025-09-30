import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

// MATERIAL
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';


import { Auth } from '@angular/fire/auth';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { ArchivoService } from '../../../servicios/archivo.service';

@Component({
  selector: 'app-archivo-form',
  templateUrl: './archivo-form.component.html',
  styleUrls: ['./archivo-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatDividerModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSelectModule
  ],
})
export class ArchivoFormComponent {
  fechaHoy = new Date();
  filesUpload: Array<{ file: File; progress: number }> = [];

  carpetas = [
    { ubicacion: 'varios', descripcion: 'VARIOS' },
    { ubicacion: 'productos', descripcion: 'PRODUCTOS' },
    { ubicacion: 'servicios', descripcion: 'SERVICIOS' },
    { ubicacion: 'proyectos', descripcion: 'PROYECTOS' },
    { ubicacion: 'productos/estrellas', descripcion: 'PRODUCTOS ESTRELLAS' },
    { ubicacion: 'productos/fichas-tecnicas', descripcion: 'FICHAS TECNICAS' },
  ];

  carpetaSeleccionado = 'productos';

  constructor(
    private fb: FormBuilder,
    public archivoServicio: ArchivoService,
    private auth: Auth,
    // public mensajeServicio: MensajeService,
    public dialogRef: MatDialogRef<ArchivoFormComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    console.log('AUTH: ', this.auth.currentUser?.email);
    console.log('Contacto');
  }

  // CERRAR VENTANA
  onNoClick(): void {
    this.dialogRef.close(false);
  }

  subir(file: File) {
    const storage = getStorage();
    const filePath = `${this.carpetaSeleccionado}/${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const fileUpload = { file, progress: 0 };
    this.filesUpload.push(fileUpload);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        fileUpload.progress = progress;
      },
      (error) => {
        console.error('Error uploading file:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {

          const tipoTodo = file.type.split('/');
          const claseDato = tipoTodo[0];
          const extencionDato = tipoTodo[1];

          this.archivoServicio.crear({
            carpeta: this.carpetaSeleccionado,
            url: downloadURL,
            nombre: file.name,
            tipo: file.type,
            tamano: file.size,
            clase: claseDato,
            extencion: extencionDato,
            fechaRegistro: this.fechaHoy
          }).then((res => {
            console.log('Archivo: ', res);
          }));
        });
      }
    );
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    const dropzone = event.target as HTMLElement;
    dropzone.classList.add('dragover');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = event.target as HTMLElement;
    dropzone.classList.remove('dragover');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = event.target as HTMLElement;
    dropzone.classList.remove('dragover');

    if (event.dataTransfer) {
      const files: FileList = event.dataTransfer.files;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.subir(file);
      }
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.subir(file);
    }
  }
}
