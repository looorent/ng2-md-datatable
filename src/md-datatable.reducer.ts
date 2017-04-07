import { Observable } from 'rxjs/Observable';

import {
  IDatatablesState,
  IDatatableState,
  TargetedAction,
  DatatableSortType,
} from './md-datatable.interfaces';

import { MdDatatableActions } from './md-datatable.actions';

export function resetDatatableState(selectableValues = []): IDatatableState {
  return {
    allRowsSelected: false,
    selectableValues,
    selectedValues: [],
  };
};

export const initialState = <IDatatablesState>{};

export function datatableReducer(datatablesState: IDatatablesState, action: TargetedAction): IDatatablesState {
  const { datatableId } = action;
  const targetedState: IDatatableState = datatablesState[datatableId] || resetDatatableState();

  const {
    allRowsSelected,
    selectableValues,
    selectedValues,
    sortBy,
    sortType,
  } = targetedState;

  switch (action.type) {
    case MdDatatableActions.UPDATE_SELECTABLE_VALUES:
      return Object.assign({}, datatablesState, { [datatableId]: resetDatatableState(action.payload) });

    case MdDatatableActions.TOGGLE_SELECT_ALL:
      return Object.assign({}, datatablesState, {
        [datatableId]: {
          allRowsSelected: action.payload,
          selectableValues,
          selectedValues: action.payload ? selectableValues.slice(0).sort() : [],
          sortBy,
          sortType,
        }
      });

    case MdDatatableActions.TOGGLE_SELECT_ONE: {
      const { selectableValue, checked } = action.payload;

      return Object.assign({}, datatablesState, {
        [datatableId]: {
          allRowsSelected: checked && selectedValues.length === selectableValues.length - 1,
          selectableValues,
          selectedValues: checked ?
            [...selectedValues, selectableValue].sort() :
            selectedValues.filter(v => v !== selectableValue),
          sortBy,
          sortType,
        }
      });
    }


    case MdDatatableActions.TOGGLE_SORT_COLUMN: {
      if (action.payload !== sortBy) {
        return Object.assign({}, datatablesState, {
          [datatableId]: {
            allRowsSelected,
            selectableValues,
            selectedValues,
            sortBy: action.payload,
            sortType: DatatableSortType.Ascending,
          }
        });
      }

      let newSortType;
      switch (sortType) {
        case DatatableSortType.None:
          newSortType = DatatableSortType.Ascending;
          break;
        case DatatableSortType.Ascending:
          newSortType = DatatableSortType.Descending;
          break;
        case DatatableSortType.Descending:
          newSortType = DatatableSortType.None;
          break;
      }

      return Object.assign({}, datatablesState, {
        [datatableId]: {
          allRowsSelected,
          selectableValues,
          selectedValues,
          sortBy,
          sortType: newSortType,
        }
      });
    }

    default:
      return datatablesState;
  }
}

export function areAllRowsSelected(datatableId: string): (state$: Observable<IDatatablesState>) => Observable<boolean> {
  return (state$: Observable<IDatatablesState>) => state$
    .map((datatablesState: IDatatablesState) => datatablesState[datatableId])
    .filter((datatableState: IDatatableState) => !!datatableState)
    .select('allRowsSelected');
}

export function isRowSelected(datatableId: string, selectableValue: string): (state$: Observable<IDatatablesState>) => Observable<boolean> {
  return (state$: Observable<IDatatablesState>) => state$
    .map((datatablesState: IDatatablesState) => datatablesState[datatableId])
    .filter((datatableState: IDatatableState) => !!datatableState)
    .select('selectedValues')
    .map((selectedValues: string) => selectedValues.includes(selectableValue))
    .merge(state$
      .map((datatablesState: IDatatablesState) => datatablesState[datatableId])
      .filter((datatableState: IDatatableState) => !!datatableState)
      .select('allRowsSelected'));
}

export function getSelectedValues(datatableId: string): (state$: Observable<IDatatablesState>) => Observable<string[]> {
  return (state$: Observable<IDatatablesState>) => state$
    .map((datatablesState: IDatatablesState) => datatablesState[datatableId])
    .filter((datatableState: IDatatableState) => !!datatableState)
    .select('selectedValues');
}

export function getSortBy(datatableId: string): (state$: Observable<IDatatablesState>) => Observable<string> {
  return (state$: Observable<IDatatablesState>) => state$
    .map((datatablesState: IDatatablesState) => datatablesState[datatableId])
    .filter((datatableState: IDatatableState) => !!datatableState)
    .select('sortBy');
}

export function getSortType(datatableId: string): (state$: Observable<IDatatablesState>) => Observable<DatatableSortType> {
  return (state$: Observable<IDatatablesState>) => state$
    .map((datatablesState: IDatatablesState) => datatablesState[datatableId])
    .filter((datatableState: IDatatableState) => !!datatableState)
    .select('sortType');
}
