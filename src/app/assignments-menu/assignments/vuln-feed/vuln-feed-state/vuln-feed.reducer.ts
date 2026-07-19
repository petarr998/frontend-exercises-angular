import { Action, createReducer, on } from '@ngrx/store';
import { CvssSortOrder, VulnFeedItem } from '../vuln-feed-models';
import { vulnFeedActions } from './vuln-feed.actions';
import { VulnFeedInitialState, VulnFeedState } from './vuln-feed.state';

const byCvss =
  (sortOrder: CvssSortOrder) => (a: VulnFeedItem, b: VulnFeedItem) =>
    sortOrder === 'cvss-asc'
      ? (a.cvss ?? -1) - (b.cvss ?? -1)
      : (b.cvss ?? -1) - (a.cvss ?? -1);

const sortImmutably = (
  vulns: VulnFeedItem[] | null,
  sortOrder: CvssSortOrder,
): VulnFeedItem[] | null => (vulns ? [...vulns].sort(byCvss(sortOrder)) : vulns);

const reducer = createReducer(
  VulnFeedInitialState,
  on(vulnFeedActions.getVulnsAction, (state) => ({
    ...state,
    isVulnsLoading: true,
    error: null,
  })),
  on(vulnFeedActions.getVulnsActionSuccess, (state, { vulns }) => ({
    ...state,
    vulns: sortImmutably(vulns, state.sortOrder),
    isVulnsLoading: false,
  })),
  on(vulnFeedActions.getVulnsActionFailure, (state, { error }) => ({
    ...state,
    error,
    isVulnsLoading: false,
  })),
  on(vulnFeedActions.setSeverityFilterAction, (state, { severity }) => ({
    ...state,
    severityFilter: severity,
  })),
  on(vulnFeedActions.setSearchQueryAction, (state, { query }) => ({
    ...state,
    searchQuery: query,
  })),
  on(vulnFeedActions.setSortOrderAction, (state, { sortOrder }) => ({
    ...state,
    sortOrder,
    vulns: sortImmutably(state.vulns, sortOrder),
  })),
);

export function vulnFeedReducer(
  state: VulnFeedState | undefined,
  action: Action,
): VulnFeedState {
  return reducer(state, action);
}
