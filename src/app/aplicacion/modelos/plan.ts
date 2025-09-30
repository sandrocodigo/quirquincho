
export interface Plan {
    id: string;

    fecha: string;
    turno: string;
    usuario: string;

    empresa: string;
    dinero: number;

    usuarioRegistro: string;
    fechaRegistro: string;

    aprobado: boolean;
    activo: boolean;
}


