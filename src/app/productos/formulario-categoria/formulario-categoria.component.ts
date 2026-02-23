import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Categoria } from '../../shared/models/models';

@Component({
  selector: 'app-formulario-categoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
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
