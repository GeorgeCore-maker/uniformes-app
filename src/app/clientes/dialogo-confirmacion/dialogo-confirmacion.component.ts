import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

interface DialogoData {
  titulo: string;
  mensaje: string;
}

@Component({
  selector: 'app-dialogo-confirmacion',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './dialogo-confirmacion.component.html',
  styleUrl: './dialogo-confirmacion.component.scss'
})
export class DialogoConfirmacionComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogoData,
    public dialogRef: MatDialogRef<DialogoConfirmacionComponent>
  ) {}

  confirmar() {
    this.dialogRef.close(true);
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
