import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VulnSeverity } from '../vuln-feed-models';
import { VulnFeedFeatureKey, VulnFeedState } from './vuln-feed.state';

const vulnFeedFeatureSelector =
  createFeatureSelector<VulnFeedState>(VulnFeedFeatureKey);

export const vulnsSelector = createSelector(
  vulnFeedFeatureSelector,
  ({ vulns }) => vulns,
);

export const vulnsLoadingSelector = createSelector(
  vulnFeedFeatureSelector,
  ({ isVulnsLoading }) => isVulnsLoading,
);

export const vulnsErrorSelector = createSelector(
  vulnFeedFeatureSelector,
  ({ error }) => error,
);

export const severityFilterSelector = createSelector(
  vulnFeedFeatureSelector,
  ({ severityFilter }) => severityFilter,
);

export const searchQuerySelector = createSelector(
  vulnFeedFeatureSelector,
  ({ searchQuery }) => searchQuery,
);

export const sortOrderSelector = createSelector(
  vulnFeedFeatureSelector,
  ({ sortOrder }) => sortOrder,
);

export const filteredVulnsSelector = createSelector(
  vulnsSelector,
  severityFilterSelector,
  searchQuerySelector,
  (vulns, severityFilter, searchQuery) => {
    if (!vulns) {
      return [];
    }
    const query = searchQuery.trim().toLowerCase();
    return vulns.filter(
      (vuln) =>
        (severityFilter === 'all' || vuln.severity === severityFilter) &&
        (query === '' ||
          vuln.id.toLowerCase().includes(query) ||
          vuln.componentName.toLowerCase().includes(query)),
    );
  },
);

const emptySeverityCounts = (): Record<VulnSeverity, number> => ({
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
  malicious: 0,
});

export const severityCountsSelector = createSelector(
  vulnsSelector,
  (vulns): Record<VulnSeverity, number> =>
    (vulns ?? []).reduce((counts, vuln) => {
      counts[vuln.severity]++;
      return counts;
    }, emptySeverityCounts()),
);
