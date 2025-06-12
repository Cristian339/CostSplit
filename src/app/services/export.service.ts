import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { GastoDTO } from '../models/gasto.model';
import { BalanceDTO } from '../models/balance.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Exporta la lista de gastos a un archivo Excel
   */
  exportarGastosAExcel(gastos: GastoDTO[], nombreGrupo: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(gastos.map(gasto => ({
      Descripción: gasto.descripcion,
      Monto: gasto.montoTotal,
      Divisa: gasto.divisa,
      Fecha: new Date(gasto.fecha).toLocaleString(),
      Pagador: gasto.idPagador,
      TipoGasto: gasto.tipoGasto,
      MétodoPago: gasto.metodoPago
    })));

    const workbook: XLSX.WorkBook = { 
      Sheets: { 'Gastos': worksheet },
      SheetNames: ['Gastos'] 
    };
    
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.guardarArchivo(excelBuffer, `Gastos_${nombreGrupo}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  /**
   * Exporta los balances a PDF
   */
  exportarBalancesAPDF(balances: BalanceDTO[], nombreGrupo: string): void {
    const doc = new jsPDF();
    
    doc.text(`Balances del grupo: ${nombreGrupo}`, 20, 20);
    
    let y = 40;
    doc.text('Usuario', 20, 30);
    doc.text('Importe', 100, 30);
    
    balances.forEach(balance => {
      doc.text(balance.usuarioNombre, 20, y);
      doc.text(balance.importe.toString() + ' €', 100, y);
      y += 10;
    });
    
    doc.save(`Balances_${nombreGrupo}.pdf`);
  }

  private guardarArchivo(buffer: any, fileName: string, fileType: string): void {
    const data: Blob = new Blob([buffer], { type: fileType });
    const a: HTMLAnchorElement = document.createElement('a');
    
    a.href = URL.createObjectURL(data);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
