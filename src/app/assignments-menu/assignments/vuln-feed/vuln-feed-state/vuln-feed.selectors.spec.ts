import { VulnFeedItem } from '../vuln-feed-models';
import {
  filteredVulnsSelector,
  severityCountsSelector,
} from './vuln-feed.selectors';

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

describe('severityCountsSelector', () => {
  it('counts each severity in its own bucket (bug #2 regression)', () => {
    const vulns = [
      makeVuln({ severity: 'low' }),
      makeVuln({ severity: 'medium' }),
      makeVuln({ severity: 'medium' }),
      makeVuln({ severity: 'high' }),
      makeVuln({ severity: 'critical' }),
      makeVuln({ severity: 'malicious' }),
    ];
    const counts = severityCountsSelector.projector(vulns);
    expect(counts.low).toBe(1);
    expect(counts.medium).toBe(2); // was 1 under the original `=== 'low'` typo
    expect(counts.high).toBe(1);
    expect(counts.critical).toBe(1);
    expect(counts.malicious).toBe(1);
  });

  it('returns all-zero counts when there are no vulns', () => {
    expect(severityCountsSelector.projector(null)).toEqual({
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
      malicious: 0,
    });
  });
});

describe('filteredVulnsSelector', () => {
  const vulns = [
    makeVuln({ id: 'CVE-1', severity: 'low', componentName: 'lodash' }),
    makeVuln({ id: 'CVE-2', severity: 'high', componentName: 'openssl' }),
    makeVuln({ id: 'MAL-3', severity: 'malicious', componentName: 'primarycare' }),
  ];

  it('returns every vuln when filter is "all" and the query is empty', () => {
    expect(filteredVulnsSelector.projector(vulns, 'all', '')).toEqual(vulns);
  });

  it('filters by severity key (bug #1 matches once key not title is dispatched)', () => {
    expect(
      filteredVulnsSelector.projector(vulns, 'high', '').map((v) => v.id),
    ).toEqual(['CVE-2']);
  });

  it('searches by id and component name, case-insensitively', () => {
    expect(
      filteredVulnsSelector.projector(vulns, 'all', 'LODASH').map((v) => v.id),
    ).toEqual(['CVE-1']);
    expect(
      filteredVulnsSelector.projector(vulns, 'all', 'cve-2').map((v) => v.id),
    ).toEqual(['CVE-2']);
  });

  it('applies severity filter and search together', () => {
    expect(
      filteredVulnsSelector.projector(vulns, 'high', 'openssl').map((v) => v.id),
    ).toEqual(['CVE-2']);
    expect(filteredVulnsSelector.projector(vulns, 'low', 'openssl')).toEqual([]);
  });

  it('returns [] when vulns is null', () => {
    expect(filteredVulnsSelector.projector(null, 'all', '')).toEqual([]);
  });
});
