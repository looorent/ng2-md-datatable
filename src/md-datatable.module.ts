import {
  NgModule,
  ModuleWithProviders,
  Optional,
  SkipSelf,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';
import { FormsModule } from '@angular/forms';

import { MdDataTableComponent } from './md-datatable.component';
import { MdDataTableColumnComponent } from './md-datatable-column.component';
import { MdDataTableHeaderComponent } from './md-datatable-header.component';
import { MdDataTablePaginationComponent } from './md-datatable-pagination.component';
import { MdDataTableRowComponent, MdDataTableCellDirective } from './md-datatable-row.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
  ],
  declarations: [
    MdDataTableComponent,
    MdDataTableColumnComponent,
    MdDataTableHeaderComponent,
    MdDataTablePaginationComponent,
    MdDataTableRowComponent,
    MdDataTableCellDirective,
  ],
  exports: [
    MdDataTableComponent,
    MdDataTableColumnComponent,
    MdDataTableHeaderComponent,
    MdDataTablePaginationComponent,
    MdDataTableRowComponent,
    MdDataTableCellDirective,
  ],
})
export class MdDataTableModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdDataTableModule,
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: MdDataTableModule) {
    if (parentModule) {
      throw new Error('MdDataTableModule already loaded; Import in root module only.');
    }
  }
}
