import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';


import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmacion',
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    // Material    
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    MatMenuModule,
    MatDividerModule,
  ],
   
})
export class ConfirmacionComponent implements OnInit {

  titulo: string;
  mensaje: string;
  nota: string;

  constructor(public dialogRef: MatDialogRef<ConfirmacionComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.titulo = data.titulo;
    this.mensaje = data.mensaje;
    this.nota = data.nota;
  }

  ngOnInit(): void {
  }

  // CONFIRMAR
  onConfirmar(): void {
    this.dialogRef.close(true);
  }

  // DENEGAR
  onCancelar(): void {
    this.dialogRef.close(false);
  }

}
