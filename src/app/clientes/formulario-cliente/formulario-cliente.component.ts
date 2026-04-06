import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Cliente } from '../../shared/models/models';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-formulario-cliente',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './formulario-cliente.component.html',
  styleUrl: './formulario-cliente.component.scss'
})
export class FormularioClienteComponent {
  formulario: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Cliente,
    public dialogRef: MatDialogRef<FormularioClienteComponent>
  ) {
    this.formulario = this.fb.group({
      nombre: [data?.nombre || '', [Validators.required, Validators.minLength(3)]],
      telefono: [data?.telefono || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: [data?.email || '', [Validators.email]],
      direccion: [data?.direccion || ''],
      ciudad: [data?.ciudad || ''],
      nit: [data?.nit || '']
    });
  }

  guardar() {
    if (this.formulario.valid) {
      this.dialogRef.close(this.formulario.value);
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
