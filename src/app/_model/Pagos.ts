export class Pagos{
  constructor(
    public Id: number,
    public NombreArchivo: string,
    public Fecha: string,
    public Estatus: string,
    public Bandera: boolean,
    public Datos: any[],
  ){}
}
