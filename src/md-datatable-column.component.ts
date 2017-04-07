import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  HostBinding,
  HostListener,
  Inject,
  Optional,
  forwardRef,
} from '@angular/core';

import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MdDataTableComponent } from './md-datatable.component';
import { MdDataTableHeaderComponent } from './md-datatable-header.component';

import {
  IDatatablesState,
  IDatatableSortEvent,
  DatatableSortType
} from './md-datatable.interfaces';

import { BaseComponent, MD_DATATABLE_STORE } from './helpers';
import { getSortBy, getSortType } from './md-datatable.reducer';
import { MdDatatableActions } from './md-datatable.actions';

@Component({
  selector: 'ng2-md-datatable-column',
  template: '<span><ng-content></ng-content></span>',
  styleUrls: ['md-datatable-column.component.css'],
})
export class MdDataTableColumnComponent extends BaseComponent implements OnInit, AfterViewInit {
  @Input() sortableValue: string;
  @Input() numeric: boolean;

  private datatableId: string;
  private sortBy$: BehaviorSubject<string> = new BehaviorSubject(null);
  private sortType$: BehaviorSubject<DatatableSortType> = new BehaviorSubject(DatatableSortType.None);
  s
  @HostBinding('class.sortable')
  get sortable(): boolean {
    return !!this.sortableValue;
  }

  @HostBinding('class.numeric')
  get hasNumericClass() {
    return this.numeric;
  }

  @HostBinding('class.sorted-ascending')
  get ascendingSort() {
    if (!this.sortable) {
      return false;
    }

    return this.sortBy$.getValue() === this.sortableValue &&
      this.sortType$.getValue() === DatatableSortType.Ascending;
  }

  @HostBinding('class.sorted-descending')
  get descendingSort() {
    if (!this.sortable) {
      return false;
    }

    return this.sortBy$.getValue() === this.sortableValue &&
      this.sortType$.getValue() === DatatableSortType.Descending;
  }

  constructor(
    @Optional() @Inject(forwardRef(() => MdDataTableComponent)) private table: MdDataTableComponent,
    @Inject(MD_DATATABLE_STORE) private store: Store<IDatatablesState>,
    private actions: MdDatatableActions,
  ) {
    super();
  }

  ngOnInit() {
    this.numeric = !!this.numeric || (this.numeric as any) === '';
  }

  ngAfterViewInit() {
    this.datatableId = this.table ? this.table.id : undefined;

    if (this.datatableId) {
      this.store
        .let(getSortBy(this.datatableId))
        .takeUntil(this.unmount$)
        .subscribe(this.sortBy$);

      this.store
        .let(getSortType(this.datatableId))
        .takeUntil(this.unmount$)
        .subscribe(this.sortType$);
    }
  }

  @HostListener('click')
  onClick() {
    if (this.datatableId && this.sortable) {
      this.store.dispatch(this.actions.toggleSortColumn(this.datatableId, this.sortableValue));
    }
  }
}
