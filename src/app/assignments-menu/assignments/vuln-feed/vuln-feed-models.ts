export type VulnSeverity = 'low' | 'medium' | 'high' | 'critical' | 'malicious';

export type VulnSeverityFilter = VulnSeverity | 'all';

export type CvssSortOrder = 'cvss-desc' | 'cvss-asc';

export interface VulnFeedItem {
  id: string;
  summary: string;
  severity: VulnSeverity;
  cvss: number | null;
  epss: number | null;
  componentName: string;
  componentVersion: string;
  publishedAt: number;
}
