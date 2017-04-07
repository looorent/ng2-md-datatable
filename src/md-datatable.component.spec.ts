import { async, TestBed } from '@angular/core/testing';
import { MaterialModule } from '@angular/material';

import { MdDataTableComponent } from './md-datatable.component';
import { customFeatureStoreModule } from './helpers';
import { datatableReducer, initialState } from './md-datatable.reducer';
import { MdDatatableActions } from './md-datatable.actions';

describe('MdDataTableComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        customFeatureStoreModule(datatableReducer, initialState),
      ],
      declarations: [
        MdDataTableComponent,
      ],
      providers: [
        { provide: MdDatatableActions, useClass: MdDatatableActions },
      ],
    }).compileComponents();
  }));

  it('should create the component', async(() => {
    let fixture = TestBed.createComponent(MdDataTableComponent);
    let instance = fixture.debugElement.componentInstance;
    expect(instance).toBeTruthy();
  }));
});
