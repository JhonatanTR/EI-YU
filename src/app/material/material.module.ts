import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorImpl } from "./mat-paginator";
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
//Aqui se deben almacenar todos los material module para no saturar el module principal
@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        FormsModule,
        MatIconModule,
        MatToolbarModule,
        MatCardModule,
        MatSnackBarModule,
        MatSidenavModule,
        MatMenuModule,
        MatDividerModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
        MatSelectModule,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCheckboxModule,
        MatAutocompleteModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatSlideToggleModule
    ],
    exports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        FormsModule,
        MatIconModule,
        MatToolbarModule,
        MatCardModule,
        MatSnackBarModule,
        MatSidenavModule,
        MatMenuModule,
        MatDividerModule,
        MatButtonModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
        MatSelectModule,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCheckboxModule,
        MatAutocompleteModule, 
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatSlideToggleModule
        
    ],
    providers: [
        { provide: MatPaginatorIntl, useClass: MatPaginatorImpl },
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
    ],
})
export class MaterialModule { }