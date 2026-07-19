import { VulnFeedItem, VulnSeverity } from './vuln-feed-models';

const SEVERITIES: VulnSeverity[] = [
  'low',
  'medium',
  'high',
  'medium',
  'critical',
  'low',
  'medium',
  'high',
  'critical',
  'malicious',
];

const COMPONENT_NAMES = [
  'jackson-databind',
  'openssl',
  'log4j-core',
  'lodash',
  'spring-web',
  'busybox',
  'curl',
  'zlib',
  'express',
  'urllib3',
];

const SUMMARIES = [
  'Improper input validation allows a remote attacker to cause a denial of service via a crafted request.',
  'A buffer overflow in the parsing routine may allow remote code execution when processing untrusted data.',
  'Deserialization of untrusted data can lead to arbitrary code execution in affected versions.',
  'An out-of-bounds read may allow an attacker to disclose sensitive memory contents.',
  'The package communicates with a domain associated with malicious activity and exfiltrates environment data.',
  'Improper certificate validation allows a man-in-the-middle attacker to spoof a trusted server.',
  'A prototype pollution issue allows attackers to modify object properties and trigger unexpected behavior.',
  'Uncontrolled resource consumption allows attackers to exhaust memory via cyclic data structures.',
];

const CVSS_BASE_BY_SEVERITY: Record<VulnSeverity, number> = {
  low: 1,
  medium: 4,
  high: 7,
  critical: 9,
  malicious: 0,
};

export function generateVulnFeed(count = 40): VulnFeedItem[] {
  return Array.from({ length: count }, (_, index) => {
    const severity = SEVERITIES[index % SEVERITIES.length];
    const isMalicious = severity === 'malicious';
    const cvssSpread = severity === 'critical' ? 10 : 29;
    const cvss = isMalicious
      ? null
      : Math.round(
          (CVSS_BASE_BY_SEVERITY[severity] + ((index * 7) % cvssSpread) / 10) *
            10,
        ) / 10;

    return {
      id: isMalicious
        ? `MAL-2024-${1000 + index * 17}`
        : `CVE-2024-${10000 + index * 137}`,
      summary: SUMMARIES[index % SUMMARIES.length],
      severity,
      cvss,
      epss: isMalicious ? null : ((index * 13) % 100) / 100,
      componentName: COMPONENT_NAMES[index % COMPONENT_NAMES.length],
      componentVersion: `${1 + (index % 4)}.${index % 10}.${(index * 3) % 10}`,
      publishedAt: 1704067200 + index * 86400 * 3,
    };
  });
}
