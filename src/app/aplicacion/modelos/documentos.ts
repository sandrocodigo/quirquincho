
export interface Documento {
    id: string;

    vehiculoPlaca: String;
    vehiculoInterno: String;

    documentoTipo: String
    documentoDescripcion: String;

    fechaInicio: String;
    fechaFin: String;

    vigente: String;

    registroFecha: String;
    registroUsuario: String;

    finalizado: boolean;
}


