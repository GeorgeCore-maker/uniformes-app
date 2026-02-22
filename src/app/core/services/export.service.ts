import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Pedido, DetallePedido, Cliente } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ExportService {

  /**
   * Exporta un pedido a PDF
   */
  exportarPedidoAPdf(pedido: Pedido, cliente?: Cliente): void {
    const doc = new jsPDF();

    // Configurar colores
    const colorPrimario: [number, number, number] = [41, 128, 185]; // Azul
    const colorTextoGris: [number, number, number] = [80, 80, 80];

    // Encabezado
    doc.setFillColor(...colorPrimario);
    doc.rect(0, 0, 210, 40, 'F');

    // Logo/Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('UNIFORMES APP', 15, 20);

    doc.setFontSize(10);
    doc.text('Comprobante de Pedido', 15, 28);

    // Información del pedido
    doc.setTextColor(...colorTextoGris);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL PEDIDO', 15, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const infoX = 15;
    let infoY = 58;
    const lineHeight = 7;

    doc.text(`Número: ${pedido.numero}`, infoX, infoY);
    infoY += lineHeight;
    doc.text(`Fecha: ${this.formatearFecha(pedido.fechaCreacion)}`, infoX, infoY);
    infoY += lineHeight;
    doc.text(`Estado: ${pedido.estado}`, infoX, infoY);
    infoY += lineHeight;
    doc.text(`Observaciones: ${pedido.observaciones || 'N/A'}`, infoX, infoY);

    // Información del cliente
    infoY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL CLIENTE', 15, infoY);

    doc.setFont('helvetica', 'normal');
    infoY += 7;
    if (cliente) {
      doc.text(`Nombre: ${cliente.nombre}`, infoX, infoY);
      infoY += lineHeight;
      doc.text(`Teléfono: ${cliente.telefono}`, infoX, infoY);
      infoY += lineHeight;
      doc.text(`Email: ${cliente.email || 'N/A'}`, infoX, infoY);
      infoY += lineHeight;
      doc.text(`NIT: ${cliente.nit || 'N/A'}`, infoX, infoY);
    }

    // Tabla de detalles
    infoY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DEL PEDIDO', 15, infoY);

    const tableData: string[][] = [];
    tableData.push(['Producto ID', 'Cantidad', 'Precio Unitario', 'Subtotal']);

    pedido.detalles.forEach((detalle: DetallePedido) => {
      tableData.push([
        detalle.productoId.toString(),
        detalle.cantidad.toString(),
        this.formatearMoneda(detalle.precioUnitario),
        this.formatearMoneda(detalle.subtotal)
      ]);
    });

    // Usar autoTable para crear tabla
    const pageHeight = doc.internal.pageSize.height;
    infoY += 7;

    // Dibujar encabezado de tabla manual
    doc.setFillColor(...colorPrimario);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, infoY, 180, 7, 'F');

    let colX = 20;
    doc.setFontSize(9);
    tableData[0].forEach((header, index) => {
      doc.text(header, colX, infoY + 5);
      colX += 40;
    });

    // Datos de tabla
    doc.setTextColor(...colorTextoGris);
    infoY += 7;
    let currentY = infoY;

    tableData.slice(1).forEach((row) => {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 20;
      }

      colX = 20;
      doc.setFontSize(9);
      row.forEach((cell) => {
        doc.text(cell, colX, currentY);
        colX += 40;
      });
      currentY += 7;
    });

    // Resumen
    currentY += 5;
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    const resumenX = 130;
    doc.text(`Subtotal: ${this.formatearMoneda(pedido.subtotal)}`, resumenX, currentY);
    currentY += 7;

    if (pedido.impuesto) {
      doc.text(`Impuesto: ${this.formatearMoneda(pedido.impuesto)}`, resumenX, currentY);
      currentY += 7;
    }

    doc.setFillColor(41, 128, 185);
    doc.setTextColor(255, 255, 255);
    doc.rect(resumenX - 10, currentY, 70, 10, 'F');
    doc.text(`Total: ${this.formatearMoneda(pedido.total)}`, resumenX, currentY + 7);

    // Pie de página
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      (doc as any).setPage(i);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Descargar
    doc.save(`Pedido_${pedido.numero}_${this.obtenerFechaArchivo()}.pdf`);
  }

  /**
   * Exporta múltiples pedidos a Excel
   */
  exportarPedidosAExcel(pedidos: Pedido[], nombreArchivo: string = 'pedidos'): void {
    const datosExcel: any[] = [];

    pedidos.forEach((pedido: Pedido) => {
      datosExcel.push({
        'Número': pedido.numero,
        'Cliente ID': pedido.clienteId,
        'Estado': pedido.estado,
        'Subtotal': pedido.subtotal,
        'Impuesto': pedido.impuesto || 0,
        'Total': pedido.total,
        'Fecha Creación': this.formatearFecha(pedido.fechaCreacion),
        'Fecha Entrega': pedido.fechaEntrega ? this.formatearFecha(pedido.fechaEntrega) : 'N/A',
        'Observaciones': pedido.observaciones || ''
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 30 }
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, `${nombreArchivo}_${this.obtenerFechaArchivo()}.xlsx`);
  }

  /**
   * Exporta detalles de un pedido a Excel
   */
  exportarDetallesPedidoAExcel(pedido: Pedido): void {
    const datosExcel: any[] = [];

    pedido.detalles.forEach((detalle: DetallePedido) => {
      datosExcel.push({
        'Producto ID': detalle.productoId,
        'Cantidad': detalle.cantidad,
        'Precio Unitario': detalle.precioUnitario,
        'Subtotal': detalle.subtotal
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalles');

    const columnWidths = [
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 12 }
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, `Detalles_Pedido_${pedido.numero}_${this.obtenerFechaArchivo()}.xlsx`);
  }

  /**
   * Métodos auxiliares
   */
  private formatearFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  private formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  private obtenerFechaArchivo(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
}
