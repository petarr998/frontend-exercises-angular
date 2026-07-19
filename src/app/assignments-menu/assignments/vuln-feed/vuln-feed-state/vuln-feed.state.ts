import {
  CvssSortOrder,
  VulnFeedItem,
  VulnSeverityFilter,
} from '../vuln-feed-models';

export const VulnFeedFeatureKey = 'vulnFeed';

export interface VulnFeedState {
  vulns: VulnFeedItem[] | null;
  isVulnsLoading: boolean;
  error: string | null;
  severityFilter: VulnSeverityFilter;
  searchQuery: string;
  sortOrder: CvssSortOrder;
}

export const VulnFeedInitialState: VulnFeedState = {
  vulns: null,
  isVulnsLoading: false,
  error: null,
  severityFilter: 'all',
  searchQuery: '',
  sortOrder: 'cvss-desc',
};
