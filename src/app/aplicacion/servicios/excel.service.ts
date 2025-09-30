import { ElementRef, Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService { 

  constructor() { }

  public exportarAExcel(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    // const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  public volverAExcel(tabla: ElementRef, excelFileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tabla.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');

    /* save to file */
    XLSX.writeFile(wb, excelFileName + '.xlsx');
  }

  public divAExcel(tabla: ElementRef, excelFileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tabla.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');

    /* save to file */
    XLSX.writeFile(wb, excelFileName + '.xlsx');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    saveAs(data, fileName + '_Reporte_' + new Date().getTime() + EXCEL_EXTENSION);
  }


  exportToExcelWithStyles(tableId: string, fileName: string): void {
    const tableElement = document.getElementById(tableId); // Selecciona la tabla por ID
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableElement); // Convierte la tabla a una hoja de Excel
  
    // Aplica estilos personalizados a las celdas
    const customStyles = {
      header: { fill: { fgColor: { rgb: 'FF0000' } } }, // Estilo para encabezados (color de fondo rojo)
      data: { fill: { fgColor: { rgb: '00FF00' } } }, // Estilo para datos (color de fondo verde)
    };
  
    // Aplica el estilo a las celdas que necesitan estilos personalizados
    // Cambia los rangos de celdas según tus necesidades
    ws['A1'].s = customStyles.header;
    ws['B1'].s = customStyles.header;
    ws['C1'].s = customStyles.header;
    ws['A2'].s = customStyles.data;
    ws['B2'].s = customStyles.data;
    ws['C2'].s = customStyles.data;
  
    const wb: XLSX.WorkBook = XLSX.utils.book_new(); // Crea un nuevo libro de Excel
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1'); // Agrega la hoja al libro
  
    /* Guarda el archivo */
    const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
  }
  


}
