import { generateVulnCards } from './vuln-cards-models';

describe('generateVulnCards', () => {
  it('produces exactly the requested number of cards', () => {
    expect(generateVulnCards(1000).length).toBe(1000);
    expect(generateVulnCards(0).length).toBe(0);
  });

  it('gives every card a unique id (stable @for/trackBy keys)', () => {
    const cards = generateVulnCards(1000);
    expect(new Set(cards.map((c) => c.id)).size).toBe(1000);
  });

  it('keeps referenceId as the original CVE/MAL id when id is suffixed', () => {
    const [first] = generateVulnCards(1);
    expect(first.id).toBe('CVE-2023-35116-1');
    expect(first.referenceId).toBe('CVE-2023-35116');
  });

  it('normalises the mock quirks into a consistent VulnCard shape', () => {
    const [first, second] = generateVulnCards(2);

    // component version comes from `versions` on the first record, `version` on the second
    expect(first.components[0].version).toBe('2.0.4');
    expect(second.components[0].version).toBe('1.0.0');

    // malicious record has no cvss/epss/disputed/cwes → safe defaults, not undefined
    expect(second.cvss).toBeNull();
    expect(second.epss).toBeNull();
    expect(second.disputed).toBe(false);
    expect(second.cwes).toEqual([]);
  });
});
