import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  ContentChildren,
  QueryList,
  Inject,
} from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import {
  IDatatablesState,
  IDatatableSelectionEvent,
  IDatatableSortEvent,
  DatatableSortType,
} from './md-datatable.interfaces';

import { MdDataTableHeaderComponent } from './md-datatable-header.component';
import { MdDataTableRowComponent } from './md-datatable-row.component';
import { BaseComponent, MD_DATATABLE_STORE } from './helpers';
import { MdDatatableActions } from './md-datatable.actions';

import {
  getSelectedValues,
  areAllRowsSelected,
  getSortBy,
  getSortType,
} from './md-datatable.reducer';

let instanceId = 0;

@Component({
  selector: 'ng2-md-datatable',
  template: `
    <table>
      <ng-content></ng-content>
    </table>
  `,
  styleUrls: ['md-datatable.component.css']
})
export class MdDataTableComponent extends BaseComponent implements OnInit, AfterViewInit {
  @Input() selectable: boolean;

  @Output() selectionChange: EventEmitter<IDatatableSelectionEvent>;
  @Output() sortChange: EventEmitter<IDatatableSortEvent>;

  @ContentChild(MdDataTableHeaderComponent) headerCmp: MdDataTableHeaderComponent;
  @ContentChildren(MdDataTableRowComponent) rowsCmp: QueryList<MdDataTableRowComponent>;

  id = `md-datatable-${instanceId++}`;

  constructor(
    @Inject(MD_DATATABLE_STORE) private store: Store<IDatatablesState>,
    private actions: MdDatatableActions,
  ) {
    super();
    this.selectionChange = new EventEmitter<IDatatableSelectionEvent>(true);
    this.sortChange = new EventEmitter<IDatatableSortEvent>(true);
  }

  ngOnInit() {
    // trick for supporting selectable attribute without a value
    this.selectable = !!this.selectable || (this.selectable as any) === '';

    // if selectable, subscribe to selection changes and emit IDatatableSelectionEvent
    if (this.selectable) {
      this.store
        .let(getSelectedValues(this.id))
        .mergeMap(
        () => this.store.let(areAllRowsSelected(this.id)),
        (selectedValues: string[], allRowsSelected: boolean) => (<IDatatableSelectionEvent>{
          allRowsSelected,
          selectedValues,
        }))
        .do((e: IDatatableSelectionEvent) => console.log(`Emitting ${JSON.stringify(e)}`))
        .subscribe(this.selectionChange);
    }

    // subscribe to sort changes and emit IDatatableSortEvent
    this.store
      .let(getSortBy(this.id))
      .combineLatest(
      this.store.let(getSortType(this.id)),
      (sortBy: string, sortType: DatatableSortType) => (<IDatatableSortEvent>{
        sortBy,
        sortType,
      }))
      .do((e: IDatatableSortEvent) => console.log(`Emitting ${JSON.stringify(e)}`))
      .subscribe(this.sortChange);
  }

  ngAfterViewInit() {
    // when datatable is selectable, update its state with all the selectable values
    if (this.selectable && this.rowsCmp) {
      this.rowsCmp.changes
        .mergeMap((query: QueryList<MdDataTableRowComponent>) => Observable
          .of(query
            .toArray()
            .map((row: MdDataTableRowComponent) => row.selectableValue))
        )
        .takeUntil(this.unmount$)
        .subscribe((selectableValues: string[]) => this.store.dispatch(
          this.actions.updateSelectableValues(this.id, selectableValues)));
    }
  }
}
