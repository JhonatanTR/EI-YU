import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { login } from 'src/app/_model/InfoLogin';
import { InfoLoginService } from 'src/app/_service/info-login.service';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import { NewPasswordDialogComponent } from './new-password-dialog/new-password-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { error } from 'console';

@Component({
  templateUrl: './cambiar-password.component.html',
  styleUrls: ['./cambiar-password.component.css'],
})
export class CambiarPasswordComponent implements OnInit {
  passwordForm!: FormGroup;
  minPasswordLength!: number;
  maxPasswordLength!: number;
  hide1 = true;
  hide2 = true;
  hide3 = true;
  usuarioPermiso: string = '';
  username: string = '';
  actualPassword: boolean;
  isError: boolean = false;
  showTooltip: boolean = false;
  @ViewChild('password') password!: ElementRef;
  @ViewChild('confirmPassword') confirmPassword!: ElementRef;
  @ViewChild('actualPassword') actualPassword$!: ElementRef;

  constructor(
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private infoLoginService: InfoLoginService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private router: Router
  ) {
    this.actualPassword = false;
  }

  ngOnInit(): void {
    this.usuarioPermiso = this.localStorageService.getDesc('permiso');
    this.minPasswordLength =
      this.usuarioPermiso === '3' || this.usuarioPermiso === '2' ? 8 : 12;
    this.maxPasswordLength = 30;

    this.passwordForm = this.fb.group(
      {
        password: new FormControl('', [
          Validators.required,
          this.customPasswordValidator.bind(this),
          Validators.minLength(this.minPasswordLength),
          Validators.maxLength(this.maxPasswordLength),
        ]),
        actualPassword: new FormControl('', Validators.required),
        confirmPassword: new FormControl('', [
          Validators.required,
          this.customPasswordValidator.bind(this),
          Validators.minLength(this.minPasswordLength),
          Validators.maxLength(this.maxPasswordLength),
        ]),
      },
      { validators: this.passwordsMatchValidator.bind(this) }
    );

    this.username = this.localStorageService.getDesc('usuario');
  }
  passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password === confirmPassword) {
      // Las contraseñas coinciden, no hay error
      group.get('confirmPassword')?.setErrors(null);
      return null;
    } else {
      // Las contraseñas no coinciden, devuelve un objeto con el error
      group.get('confirmPassword')?.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    }
  }

  passwordControlHasError(controlName: string, errorName: string): boolean {
    const control = this.passwordForm.get(controlName);
    return control?.hasError(errorName) ?? false;
  }
  validarPassword() {
    const nuevaPasswordControl = this.passwordForm.get('password');
    const nuevaPassword = nuevaPasswordControl?.value;

    const isPasswordValid = this.isPasswordValid(nuevaPassword);

    if (isPasswordValid) {
      nuevaPasswordControl?.setErrors(null);
    } else {
      nuevaPasswordControl?.setErrors({ invalidPassword: true });
    }
  }
  customPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.value;
    const isPasswordValid = this.isPasswordValid(newPassword);

    const hasErrors = Object.values(isPasswordValid).some((error) => !error);

    if (hasErrors) {
      return { invalidPassword: true, isPasswordValid };
    } else {
      return null;
    }
  }

  isPasswordValid2(password: string): boolean {
    // Debe incluir letras y números, al menos una mayúscula y un carácter especial.
    const hasLetterAndNumber =
      /[a-zA-Z]+/.test(password) && /[0-9]+/.test(password);
    const hasUppercase = /[A-Z]+/.test(password);
    const hasSpecialCharacter =
      /[,\.\-\*\!\/\"\#\$\$\%\&\(\)\=\?\'\¿\¡\@\|\°\¬]+/.test(password);
    // No debe contener espacios en blanco.
    const hasNoWhitespace = !/\s+/.test(password);
    // No debe contener la letra Ñ.
    const hasNoLetterÑ = !/[ñÑ]+/.test(password);
    // Tercia de números consecutivos ascendente y descendente no permitidos.
    const hasNoConsecutiveNumbers =
      !/(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)/.test(
        password
      );
    // Tercia de letras consecutivas ascendente y descendente no permitidos.
    const hasNoConsecutiveLetters =
      !/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|zyx|yxw|xwv|wvu|vut|uts|tsr|srq|rqp|qpo|pon|onm|nml|mlk|lkj|kji|jih|hgf|gfe|fed|edc|dcb|cba|aqp|bpr|cps|dtq|eur|fvs|gwt|hux|ivy|jwz|kxa|lyb|mzc|nad|obe|pcf|qdg|reh|sfi|tgj|uhk|vil|wjm|xkn|ylo|zmp)/i.test(
        password
      );

    // El nombre de la institución SPEI, BANXICO, SPID o la clave de la institución
    const hasNoInstitutionNamAndNumber = !/(banxico|spei|spid|2001)/i.test(
      password
    );
    // Comprobar todos los requisitos y devolver el resultado final.
    return (
      hasLetterAndNumber &&
      hasUppercase &&
      hasSpecialCharacter &&
      hasNoWhitespace &&
      hasNoLetterÑ &&
      hasNoConsecutiveNumbers &&
      hasNoConsecutiveLetters &&
      hasNoInstitutionNamAndNumber
    )
  }

  isPasswordValid(password: string): { [key: string]: boolean } {
    const errors = {
      hasLetterAndNumber: false,
      hasUppercase: false,
      hasSpecialCharacter: false,
      hasNoWhitespace: false,
      hasNoLetterÑ: false,
      hasNoConsecutiveNumbers: false,
      hasNoConsecutiveLetters: false,
      hasNoInstitutionNamAndNumber: false,
    };
    // Debe incluir letras y números, al menos una mayúscula y un carácter especial.
    /*const hasLetterAndNumber =
      /[a-zA-Z]+/.test(password) && /[0-9]+/.test(password);*/
    if (/[a-zA-Z]+/.test(password) && /[0-9]+/.test(password)) {
      errors.hasLetterAndNumber = true;
    }
    if (/[A-Z]+/.test(password)) {
      errors.hasUppercase = true;
    }
    if (/[,\.\-\*\!\/\"\#\$\$\%\&\(\)\=\?\'\¿\¡\@\|\°\¬]+/.test(password)) {
      errors.hasSpecialCharacter = true;
    }
    if (!/\s+/.test(password)) {
      errors.hasNoWhitespace = true;
    }
    if (!/[ñÑ]+/.test(password)) {
      errors.hasNoLetterÑ = true;
    }
    if (
      !/(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)/.test(
        password
      )
    ) {
      errors.hasNoConsecutiveNumbers = true;
    }
    if (
      !/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|zyx|yxw|xwv|wvu|vut|uts|tsr|srq|rqp|qpo|pon|onm|nml|mlk|lkj|kji|jih|ihg|hgf|gfe|fed|edc|dcb|cba)/.test(
        password
      )
    ) {
      errors.hasNoConsecutiveLetters = true;
    }
    if (!/(banxico|spei|spid|2001)/i.test(password)) {
      errors.hasNoInstitutionNamAndNumber = true;
    }
    //const hasUppercase = /[A-Z]+/.test(password);
    //const hasSpecialCharacter = /[,\.\-\*\!\/\"\#\$\$\%\&\(\)\=\?\'\¿\¡\@\|\°\¬]+/.test(password);

    // No debe contener espacios en blanco.
    //const hasNoWhitespace = !/\s+/.test(password);

    // No debe contener la letra Ñ.
    // const hasNoLetterÑ = !/[ñÑ]+/.test(password);

    // Tercia de números consecutivos ascendente y descendente no permitidos.
    /*const hasNoConsecutiveNumbers =
      !/(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)/.test(
        password
      );*/

    // Tercia de letras consecutivas ascendente y descendente no permitidos.
    /*const hasNoConsecutiveLetters =
      !/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|zyx|yxw|xwv|wvu|vut|uts|tsr|srq|rqp|qpo|pon|onm|nml|mlk|lkj|kji|jih|hgf|gfe|fed|edc|dcb|cba|aqp|bpr|cps|dtq|eur|fvs|gwt|hux|ivy|jwz|kxa|lyb|mzc|nad|obe|pcf|qdg|reh|sfi|tgj|uhk|vil|wjm|xkn|ylo|zmp)/i.test(
        password
      );*/

    // El nombre de la institución SPEI, BANXICO, SPID o la clave de la institución
    /* const hasNoInstitutionNamAndNumber = !/(banxico|spei|spid|2001)/i.test(
      password
    );*/
    // Comprobar todos los requisitos y devolver el resultado final.
    /*return (
      hasLetterAndNumber &&
      hasUppercase &&
      hasSpecialCharacter &&
      hasNoWhitespace &&
      hasNoLetterÑ &&
      hasNoConsecutiveNumbers &&
      hasNoConsecutiveLetters &&
      hasNoInstitutionNamAndNumber
    );*/
    return errors;
  }
  onSubmit() {
    let constraseña = this.passwordForm.get('password')?.value;
    let constraseñaConfirmada = this.passwordForm.get('confirmPassword')?.value;
    this.actualPassword = false;
    let actutalpassword = this.passwordForm.get('actualPassword')?.value;
    let log = new login();
    log.usuario = this.username;
    log.password = actutalpassword;

    this.infoLoginService.login(log).subscribe(
      (data) => {
        if (data.mensaje === 'OK') {
          this.actualPassword = false;
          if (
            this.isPasswordValid2(constraseña) &&
            this.isPasswordValid2(constraseñaConfirmada)
          ) {
            if (constraseña === constraseñaConfirmada) {
              if (constraseña === actutalpassword) {
                this.isError = true;
              } else {
                data.usuario.password = constraseña;
                let sesion: any = data;
                this.actualizarPassword(sesion);
              }
            }
          }
        } else {
          this.passwordForm
            .get('actualPassword')
            ?.setErrors({ actualPassword: true });
          this.actualPassword = true;
        }
      },
      (error) => {
        this.snackbar.open(
          'Error al recuperar la contraseña actual. Intentelo de nuevo.',
          'Cerrar',
          {
            duration: 3000,
          }
        );
      }
    );
  }
  borrarInput() {
    // Método llamado cuando el usuario borra el input
    this.passwordForm.get('actualPassword')?.setErrors(null); // Limpiar los errores
  }
  actualizarPassword(data: any) {
    this.infoLoginService.actualizarUsuario(data.usuario).subscribe(
      (data) => {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '50%';
        dialogConfig.height = '60%';
        dialogConfig.maxWidth = '95%';
        dialogConfig.disableClose = true;
        const dialogref = this.dialog.open(
          NewPasswordDialogComponent,
          dialogConfig
        );
        dialogref.afterClosed().subscribe((result) => {
          this.password.nativeElement.value = '';
          this.confirmPassword.nativeElement.value = '';
          this.actualPassword$.nativeElement.value = '';
          this.passwordForm.reset();
          this.router.navigate(['/dashboard']);
        });
      },
      (error) => {
        this.snackbar.open(
          'Error al actualizar la contraseña. Intentelo de nuevo.',
          'Cerrar',
          {
            duration: 3000,
          }
        );
      }
    );
  }
}
