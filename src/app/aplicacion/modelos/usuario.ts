export interface User {
    id: string;

    email: string;
    admin: string;

    activo: boolean;
}



export class Usuario2 {
    constructor(
        public email: string,
    ) { }
}

class Usuario {
    constructor(public email: string, public aceptoInvitacion: string) {
        this.email = email;
        this.aceptoInvitacion = aceptoInvitacion;
    }
    toString() {
        return this.email + ', ' + this.aceptoInvitacion;
    }
}

// Firestore data converter
const cityConverter = {
    toFirestore: (city: { name: any; state: any; country: any; }) => {
        return {
            name: city.name,
            state: city.state,
            country: city.country
        };
    },
    fromFirestore: (snapshot: { data: (arg0: any) => any; }, options: any) => {
        const data = snapshot.data(options);
        return new Usuario(data.name, data.state);
    }
};