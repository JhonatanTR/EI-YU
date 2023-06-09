import { InfoBancos } from "./InfoBancos";

export class InfoCapturaSPEI{
    destinatario :string="";
    nombreBeneficiario:string="";
    numeroCuenta:string="";
    infoBancos!:InfoBancos;
    monto:number=0;
    refNumerica:string="";
    claveRastreo:string="";
    conceptoPago:string="";
   
    
 
}