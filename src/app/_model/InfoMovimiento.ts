import { InfoMovimientoDetalle } from "./InfoMovimientoDetalle";

export class InfoMovimiento {
    cve_rastreo: string = "";
    concepto_pago: string = "";
    fecha_creacion: string = "";;
    tipomoviiento: string = "";;
    institucion: string = "";;
    estatus: string = "";
    bl: boolean =false;
    infoM:InfoMovimientoDetalle | undefined;
    monto:number=0;
}