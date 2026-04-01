import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Producto, CategoriaProducto } from '../../shared/models/models';

@Component({
  selector: 'app-formulario-producto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './formulario-producto.component.html',
  styleUrl: './formulario-producto.component.scss'
})
export class FormularioProductoComponent {
  formulario: FormGroup;
  categorias = Object.values(CategoriaProducto);

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Producto,
    public dialogRef: MatDialogRef<FormularioProductoComponent>
  ) {
    this.formulario = this.fb.group({
      nombre: [data?.nombre || '', [Validators.required, Validators.minLength(3)]],
      categoria: [data?.categoria || '', Validators.required],
      talla: [data?.talla || '', Validators.required],
      precio: [data?.precio || '', [Validators.required, Validators.min(0)]],
      costo: [data?.costo || '', [Validators.required, Validators.min(0)]],
      stock: [data?.stock || '', [Validators.required, Validators.min(0)]],
      stockMinimo: [data?.stockMinimo || '', [Validators.required, Validators.min(0)]],
      requiereConfeccion: [data?.requiereConfeccion || false]
    }, { validators: this.validarCostoPrecio.bind(this) });
  }

  validarCostoPrecio(control: AbstractControl) {
    const costo = control.get('costo')?.value;
    const precio = control.get('precio')?.value;
    return costo >= precio ? { costoMayorPrecio: true } : null;
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
