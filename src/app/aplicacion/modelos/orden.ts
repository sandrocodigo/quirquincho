
export interface Orden {
    id: string;

    sucursal: String;
    codigo: number;

    vehiculoId: String;
    vehiculoNumero: String;
    vehiculoPlaca: String;
    vehiculoInterno: String;

    mantenimientoId: String
    mantemimientoTipo: String
    mantenimientoDescripcion: String
    mantenimientoFrecuencia: String
    mantenimientoKilometraje: String

    kilometrajeActual: String

    kilometraje: number;
    kilometrajeInicio: number;
    kilometrajeProximo: number;

    frecuencia: String;
    fechaInicio: String;
    fechaProximo: String;

    taller: String;
    fechaEntrada: String;
    fechaSalida: String;

    causa: String;

    observaciones: String;

    activo: boolean;
}


