import {
  Component,
  AfterViewInit,
  Input,
  HostBinding,
  HostListener,
  ContentChild,
  ContentChildren,
  QueryList,
  Inject,
  Optional,
  forwardRef,
} from '@angular/core';

import { MdCheckbox, MdCheckboxChange } from '@angular/material';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { BaseComponent, MD_DATATABLE_STORE } from './helpers';
import { IDatatablesState } from './md-datatable.interfaces';
import { MdDataTableComponent } from './md-datatable.component';
import { MdDataTableCellDirective } from './md-datatable-cell.directive';
import { isRowSelected } from './md-datatable.reducer';
import { MdDatatableActions } from './md-datatable.actions';

@Component({
  selector: 'ng2-md-datatable-row',
  template: `
    <td *ngIf="selectable" class="md-data-check-cell">
      <md-checkbox [checked]="checked$ | async" (change)="onCheckboxChange($event)"></md-checkbox>
    </td>
    <ng-content></ng-content>
  `,
  styleUrls: ['md-datatable-row.component.css'],
})
export class MdDataTableRowComponent extends BaseComponent implements AfterViewInit {
  @Input() selectableValue: string;
  checked$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @ContentChild(MdCheckbox) checkboxCmp: MdCheckbox;
  @ContentChildren(MdDataTableCellDirective) cellsCmp: QueryList<MdDataTableCellDirective>;

  private datatableId: string;

  @HostBinding('class.selectable')
  get selectable(): boolean {
    return !!this.selectableValue && this.table && this.table.selectable;
  }

  @HostBinding('class.checked')
  get isChecked(): boolean {
    return this.checked$.getValue();
  }

  @HostListener('click', ['$event'])
  onRowClick(event: MouseEvent) {
    // react only on selectable rows
    if (!this.selectable) {
      return;
    }

    // propagate clicks on the whole row (except on links) to MdCheckbox
    if (this.selectable && this.checkboxCmp && event.target['nodeName'] !== 'A') {
      event.preventDefault();
      this.checkboxCmp.toggle();
    }
  }

  constructor(
    @Optional() @Inject(forwardRef(() => MdDataTableComponent)) private table: MdDataTableComponent,
    @Inject(MD_DATATABLE_STORE) private store: Store<IDatatablesState>,
    private actions: MdDatatableActions,
  ) {
    super();
  }

  ngAfterViewInit() {
    this.datatableId = this.table ? this.table.id : undefined;

    this.store
      .let(isRowSelected(this.datatableId, this.selectableValue))
      .takeUntil(this.unmount$)
      .subscribe(this.checked$);

    this.checked$.do(x => console.log(x));
  }

  onCheckboxChange(event: MdCheckboxChange) {
    this.store
      .dispatch(this.actions.toggleSelectOne(this.datatableId, this.selectableValue, event.checked));
  }
}
