import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DialogoConfirmacionData {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  colorConfirmar?: 'primary' | 'accent' | 'warn';
  iconoTitulo?: string;
}

@Component({
  selector: 'app-dialogo-confirmacion',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dialogo-confirmacion.component.html',
  styleUrl: './dialogo-confirmacion.component.scss'
})
export class DialogoConfirmacionComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogoConfirmacionData,
    public dialogRef: MatDialogRef<DialogoConfirmacionComponent>
  ) {
    // Valores por defecto
    this.data.textoConfirmar = this.data.textoConfirmar || 'Confirmar';
    this.data.textoCancelar = this.data.textoCancelar || 'Cancelar';
    this.data.colorConfirmar = this.data.colorConfirmar || 'warn';
  }

  confirmar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
