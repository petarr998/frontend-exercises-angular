import { VulnFeedItem } from '../vuln-feed-models';
import { vulnFeedActions } from './vuln-feed.actions';
import { vulnFeedReducer } from './vuln-feed.reducer';
import { VulnFeedInitialState, VulnFeedState } from './vuln-feed.state';

function makeVuln(overrides: Partial<VulnFeedItem> = {}): VulnFeedItem {
  return {
    id: 'CVE-0000-0001',
    summary: 'summary',
    severity: 'low',
    cvss: 5,
    epss: 0.1,
    componentName: 'lodash',
    componentVersion: '1.0.0',
    publishedAt: 1704067200,
    ...overrides,
  };
}

describe('vulnFeedReducer', () => {
  it('sets loading and clears any previous error on getVulnsAction', () => {
    const state: VulnFeedState = { ...VulnFeedInitialState, error: 'boom' };
    const next = vulnFeedReducer(state, vulnFeedActions.getVulnsAction());
    expect(next.isVulnsLoading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('stores vulns sorted by the active order and stops loading on success', () => {
    const vulns = [makeVuln({ id: 'a', cvss: 1 }), makeVuln({ id: 'b', cvss: 9 })];
    const state: VulnFeedState = { ...VulnFeedInitialState, isVulnsLoading: true };
    const next = vulnFeedReducer(
      state,
      vulnFeedActions.getVulnsActionSuccess({ vulns }),
    );
    expect(next.isVulnsLoading).toBe(false);
    expect(next.vulns?.map((v) => v.id)).toEqual(['b', 'a']); // default cvss-desc
  });

  it('does not mutate the incoming vulns array on success', () => {
    const vulns = [makeVuln({ id: 'a', cvss: 1 }), makeVuln({ id: 'b', cvss: 9 })];
    const snapshot = [...vulns];
    vulnFeedReducer(
      VulnFeedInitialState,
      vulnFeedActions.getVulnsActionSuccess({ vulns }),
    );
    expect(vulns).toEqual(snapshot);
  });

  it('stops loading AND records the error on failure (bug #4 regression)', () => {
    const state: VulnFeedState = { ...VulnFeedInitialState, isVulnsLoading: true };
    const next = vulnFeedReducer(
      state,
      vulnFeedActions.getVulnsActionFailure({ error: 'kaboom' }),
    );
    expect(next.isVulnsLoading).toBe(false);
    expect(next.error).toBe('kaboom');
  });

  it('re-sorts immutably on setSortOrder, yielding a NEW array reference (bug #3 regression)', () => {
    const vulns = [makeVuln({ id: 'a', cvss: 9 }), makeVuln({ id: 'b', cvss: 1 })];
    const loaded: VulnFeedState = { ...VulnFeedInitialState, vulns };
    const next = vulnFeedReducer(
      loaded,
      vulnFeedActions.setSortOrderAction({ sortOrder: 'cvss-asc' }),
    );
    expect(next.vulns).not.toBe(vulns); // new reference => memoized selectors recompute
    expect(next.vulns?.map((v) => v.id)).toEqual(['b', 'a']);
    expect(next.sortOrder).toBe('cvss-asc');
  });

  it('orders null cvss last on desc and first on asc', () => {
    const vulns = [makeVuln({ id: 'scored', cvss: 5 }), makeVuln({ id: 'na', cvss: null })];
    const desc = vulnFeedReducer(
      { ...VulnFeedInitialState, vulns },
      vulnFeedActions.setSortOrderAction({ sortOrder: 'cvss-desc' }),
    );
    expect(desc.vulns?.map((v) => v.id)).toEqual(['scored', 'na']);
    const asc = vulnFeedReducer(
      { ...VulnFeedInitialState, vulns },
      vulnFeedActions.setSortOrderAction({ sortOrder: 'cvss-asc' }),
    );
    expect(asc.vulns?.map((v) => v.id)).toEqual(['na', 'scored']);
  });

  it('stores the severity filter', () => {
    const next = vulnFeedReducer(
      VulnFeedInitialState,
      vulnFeedActions.setSeverityFilterAction({ severity: 'high' }),
    );
    expect(next.severityFilter).toBe('high');
  });

  it('stores the search query', () => {
    const next = vulnFeedReducer(
      VulnFeedInitialState,
      vulnFeedActions.setSearchQueryAction({ query: 'log4j' }),
    );
    expect(next.searchQuery).toBe('log4j');
  });
});
