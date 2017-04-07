import { Component, OnInit, AfterViewInit, OnDestroy, ContentChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import {
  MdDataTableComponent,
  MdDataTablePaginationComponent,
  IDatatableSelectionEvent,
  IDatatableSortEvent,
  IDatatablePaginationEvent,
} from '../../../dist';

import { TShirt } from './app.interfaces';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'Demo App: T-Shirts';
  tshirts: TShirt[];

  @ContentChild(MdDataTableComponent) datatable: MdDataTableComponent;
  @ContentChild(MdDataTablePaginationComponent) pagination: MdDataTablePaginationComponent;

  private unmount$: Subject<void> = new Subject<void>();

  constructor(private appService: AppService) { }

  ngOnInit() {
    this.tshirts = this.appService.getDemoDatasource(1, 10);
  }

  ngAfterViewInit() {
    if (this.datatable) {
      this.datatable.selectionChange
        //.takeUntil(this.unmount$)
        .subscribe((x: IDatatableSelectionEvent) => console.log(x));
    }
  }

  ngOnDestroy() {
    this.unmount$.next();
    this.unmount$.complete();
  }
}
