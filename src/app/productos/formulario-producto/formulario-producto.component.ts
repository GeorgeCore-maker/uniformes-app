import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Producto, CategoriaProducto } from '../../shared/models/models';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-formulario-producto',
  standalone: true,
  imports: [
    SharedModule
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
