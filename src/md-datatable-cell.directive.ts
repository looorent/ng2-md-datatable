import {
  Directive,
  HostBinding,
  Optional,
  Inject,
  forwardRef,
} from '@angular/core';

import { MdDataTableComponent } from './md-datatable.component';
import { MdDataTableRowComponent } from './md-datatable-row.component';

@Directive({ selector: 'td' })
export class MdDataTableCellDirective {
  constructor(
    @Optional() @Inject(forwardRef(() => MdDataTableComponent)) private tableCmp: MdDataTableComponent,
    @Optional() @Inject(forwardRef(() => MdDataTableRowComponent)) private rowCmp: MdDataTableRowComponent,
  ) { }

  @HostBinding('class.numeric')
  get isNumeric() {
    if (!this.tableCmp || !this.tableCmp.headerCmp || !this.rowCmp) {
      return false;
    }

    let index = -1;

    this.rowCmp.cellsCmp.find((cell, i) => {
      const match = cell === this;

      if (match) {
        index = i;
      }

      return match;
    });

    if (index === -1) {
      return false;
    }

    return !!this.tableCmp.headerCmp.columnTypes[index];
  }
}
