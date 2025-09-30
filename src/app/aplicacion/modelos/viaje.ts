
export interface Viaje {
    id: String;

    codigo: String;

    fecha: string;
    origen: String;
    destino: String;
    monto: number;
    montoLiteral: String;

    // Asignacion
    codigoAsignacion: number;

    // Cliente
    clienteEmpresa: String;
    clienteArea: String;
    clienteResponsable: String;

    // Vehiculo
    vehiculoNumero: number;
    vehiculoPlaca: String;
    vehiculoConductor: String;

    // Parqueo
    parqueo: String;


    responsable: String;
    email: String;

    activo: boolean;
}


