
export interface Asignacion {
    id: string;

    vehiculoPlaca: String;
    vehiculoInterno: String;

    conductorNombres: String
    conductorApellidos: String;

    kilometrajeInicio: number;
    kilometrajeFin: number;

    fechaInicio: String;
    fechaFin: String;

    contenido: String;

    registroFecha: String;
    registroUsuario: String;

    finalizado: boolean;
}


