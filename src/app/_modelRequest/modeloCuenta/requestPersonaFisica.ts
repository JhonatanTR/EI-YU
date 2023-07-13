import { comprobantes } from './comprobantes';
import { perfil } from './perfil';
import { domicilio } from './domicilio';
import { persona } from './persona';
export class requestPersonaFisica {
  certificado: string = '';
  llave: string = '';
  phrase: string = '';
  token: string = '';
  pblu: number = 0;
  persona!: persona;
  comprobantes: comprobantes = [];
  domicilio!: domicilio;
  perfil!: perfil;
  udnId: number = 60;
  uuid: string = '';
  nivel_cuenta: number = 1;
  clabe: string = "";
  estatus: string = "";

}
