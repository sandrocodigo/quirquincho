
export interface Programacion {
    id: string;

    vehiculoPlaca: String;
    vehiculoInterno: String;

    mantenimientoTipo: String
    mantenimientoDescripcion: String;

    kilometraje: number;
    kilomtrajeInicio: number;
    kilomtrajeProximo: number;

    frecuencia: String;
    fechaInicio: String;
    fechaProximo: String;

    telefono: String;
    email: String;

    registroFecha: String;
    registroUsuario: String;

    finalizado: boolean;
}


