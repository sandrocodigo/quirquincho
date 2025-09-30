
export interface EgresoDetalle {
    id: string;

    fecha: string;

    ingresoId: string;
    ingresoCodigo: string;
    ingresoDescripcion: string;
    ingreso: string;

    productoId: string;
    productoCodigo: string;
    productoDescripcion: string;
    productoImagenUrl: string;
    producto: string;

    cantidad: number;
    pc: number;
    pv: number;
    subtotal: number;

    aprobado: boolean,
    
}


