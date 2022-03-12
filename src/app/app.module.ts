import { environment } from './../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule} from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
// import the TreeGridModule for the TreeGrid component
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule} from '@angular/material/dialog';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTabsModule} from '@angular/material/tabs';
import {MatBadgeModule} from '@angular/material/badge';
import {MatCheckboxModule } from '@angular/material/checkbox';

import { TreeGridModule } from '@syncfusion/ej2-angular-treegrid';
import { PageService, SortService, FilterService,FreezeService,
  SelectionService,ReorderService } from '@syncfusion/ej2-angular-treegrid';
import { AppComponent } from './app.component';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AddEditColumnComponent } from './add-edit-column/add-edit-column.component';
import { AddEditRowComponent } from './add-edit-row/add-edit-row.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas,faPlus,faMinus} from '@fortawesome/free-solid-svg-icons';

const config: SocketIoConfig = { url: environment.socketUrl, options: {transports: ['websocket']} };

@NgModule({
  declarations: [
    AppComponent,
    AddEditColumnComponent,
    AddEditRowComponent,

  ],
  imports: [
    BrowserModule,
    CommonModule,
    TreeGridModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatPaginatorModule,
    MatMenuModule,
    MatIconModule,
    MatDatepickerModule,
    MatTableModule,
    MatTabsModule,
    MatBadgeModule,
    MatNativeDateModule,
    MatDialogModule,
    MatGridListModule,
    MatTooltipModule,
    MatCheckboxModule,

    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot([]),
    SocketIoModule.forRoot(config)
  ],
  bootstrap: [AppComponent],
  providers: [PageService,
    SortService,
    FilterService,
    SelectionService,
    ReorderService]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
    library.addIcons(faPlus,faMinus);
  }
}
