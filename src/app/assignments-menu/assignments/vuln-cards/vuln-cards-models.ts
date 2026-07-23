import { vulnList } from './vuln-cards-mock-data';

export type VulnCardSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'malicious';

export interface VulnCardComponentRef {
  name: string;
  version: string;
}

export interface VulnCardCwe {
  id: string;
  name: string;
  description: string;
}

export interface VulnCard {
  id: string;
  referenceId: string;
  summary: string;
  severity: VulnCardSeverity;
  cvss: number | null;
  cvssVersion: string | null;
  epss: number | null;
  disputed: boolean;
  cwes: VulnCardCwe[];
  publishedAt: number; // epoch seconds
  modifiedAt: number; // epoch seconds
  components: VulnCardComponentRef[];
  mappingSources: string[];
}

// Shape of the raw mock records — deliberately loose so the normaliser below is
// the single place that reconciles the data quirks (component `version` vs
// `versions`, malicious entries missing cvss/epss/cwes).
interface RawVuln {
  id: string;
  summary?: string;
  severity: string;
  cvss?: number;
  cvssVersion?: string;
  epss?: number;
  disputed?: boolean;
  cwes?: VulnCardCwe[];
  publishedAt: number;
  modifiedAt: number;
  components?: Array<{ name: string; version?: string; versions?: string }>;
  mappingSources?: string[];
}

function toVulnCard(raw: RawVuln): VulnCard {
  return {
    id: raw.id,
    referenceId: raw.id,
    summary: raw.summary ?? '',
    severity: raw.severity as VulnCardSeverity,
    cvss: raw.cvss ?? null,
    cvssVersion: raw.cvssVersion ?? null,
    epss: raw.epss ?? null,
    disputed: raw.disputed ?? false,
    cwes: raw.cwes ?? [],
    publishedAt: raw.publishedAt,
    modifiedAt: raw.modifiedAt,
    components: (raw.components ?? []).map((component) => ({
      name: component.name,
      version: component.version ?? component.versions ?? '',
    })),
    mappingSources: raw.mappingSources ?? [],
  };
}

const baseCards: VulnCard[] = (vulnList as unknown as RawVuln[]).map(toVulnCard);

/**
 * Produces `count` cards by cycling the mock records and giving each a unique
 * id, so the virtual list has stable @for/trackBy keys.
 */
export function generateVulnCards(count: number): VulnCard[] {
  return Array.from({ length: count }, (_, index) => {
    const base = baseCards[index % baseCards.length];
    return { ...base, id: `${base.id}-${index + 1}` };
  });
}
