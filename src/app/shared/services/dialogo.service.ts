import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogoConfirmacionComponent, DialogoConfirmacionData } from '../components/dialogo-confirmacion/dialogo-confirmacion.component';

@Injectable({
  providedIn: 'root'
})
export class DialogoService {
  constructor(private dialog: MatDialog) {}

  /**
   * Abre un diálogo de confirmación genérico
   * @param data - Datos del diálogo
   * @returns Observable<boolean> - true si se confirmó, false si se canceló
   */
  confirmar(data: DialogoConfirmacionData): Observable<boolean> {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: data
    });

    return dialogRef.afterClosed();
  }

  /**
   * Diálogo de confirmación para eliminar con configuración predefinida
   * @param titulo - Título del diálogo
   * @param mensaje - Mensaje a mostrar
   * @returns Observable<boolean>
   */
  confirmarEliminacion(titulo: string, mensaje: string): Observable<boolean> {
    return this.confirmar({
      titulo,
      mensaje,
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar',
      colorConfirmar: 'warn',
      iconoTitulo: 'warning'
    });
  }

  /**
   * Diálogo de confirmación para guardar con configuración predefinida
   * @param titulo - Título del diálogo
   * @param mensaje - Mensaje a mostrar
   * @returns Observable<boolean>
   */
  confirmarGuardado(titulo: string, mensaje: string): Observable<boolean> {
    return this.confirmar({
      titulo,
      mensaje,
      textoConfirmar: 'Guardar',
      textoCancelar: 'Cancelar',
      colorConfirmar: 'primary',
      iconoTitulo: 'save'
    });
  }

  /**
   * Diálogo de confirmación para acciones genéricas
   * @param titulo - Título del diálogo
   * @param mensaje - Mensaje a mostrar
   * @param accion - Texto del botón de confirmación
   * @returns Observable<boolean>
   */
  confirmarAccion(titulo: string, mensaje: string, accion: string = 'Aceptar'): Observable<boolean> {
    return this.confirmar({
      titulo,
      mensaje,
      textoConfirmar: accion,
      textoCancelar: 'Cancelar',
      colorConfirmar: 'primary',
      iconoTitulo: 'info'
    });
  }
}
