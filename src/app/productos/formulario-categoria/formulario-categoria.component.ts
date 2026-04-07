import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Categoria } from '../../shared/models/models';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-formulario-categoria',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './formulario-categoria.component.html',
  styleUrl: './formulario-categoria.component.scss'
})
export class FormularioCategoriaComponent {
  formulario: FormGroup;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FormularioCategoriaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Categoria | {}
  ) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['']
    });

    if (data && 'nombre' in data) {
      this.formulario.patchValue(data);
      this.isEditing = true;
    }
  }

  guardar() {
    if (this.formulario.valid) {
      this.dialogRef.close(this.formulario.value);
    }
  }

  cancelar() {
    this.dialogRef.close();
  }

  get nombreControl() {
    return this.formulario.get('nombre');
  }

  get descripcionControl() {
    return this.formulario.get('descripcion');
  }
}
