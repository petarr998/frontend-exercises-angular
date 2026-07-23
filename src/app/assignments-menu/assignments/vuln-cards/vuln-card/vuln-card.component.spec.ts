import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VulnCard } from '../vuln-cards-models';
import { VulnCardComponent } from './vuln-card.component';

const mockCard: VulnCard = {
  id: 'CVE-2023-35116-1',
  referenceId: 'CVE-2023-35116',
  summary: 'A crafted object can cause a denial of service.',
  severity: 'medium',
  cvss: 4.7,
  cvssVersion: '3.1',
  epss: 0.31,
  disputed: true,
  cwes: [{ id: 'CWE-770', name: 'Resource limits', description: '…' }],
  publishedAt: 1686752100,
  modifiedAt: 1732176420,
  components: [{ name: 'AaZoran-Test', version: '2.0.4' }],
  mappingSources: ['nvd'],
};

describe('VulnCardComponent', () => {
  let fixture: ComponentFixture<VulnCardComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VulnCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VulnCardComponent);
    fixture.componentRef.setInput('data', mockCard);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('renders the id, severity letter, and stacked source logo', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(el.querySelector('.card__id')?.textContent).toContain('CVE-2023-35116-1');
    expect(el.querySelector('.card__severity')?.textContent?.trim()).toBe('M');
    expect(el.querySelector('.card__logo')).toBeTruthy();
    expect(el.querySelector('.card__source img')?.getAttribute('src')).toContain(
      'nvd-icon-new.svg',
    );
  });

  it('uses SeverityParams.abbr so malicious is distinct from medium', () => {
    fixture.componentRef.setInput('data', {
      ...mockCard,
      severity: 'malicious' as const,
    });
    fixture.detectChanges();
    const badge = el.querySelector('.card__severity') as HTMLElement;
    expect(badge.textContent?.trim()).toBe('MAL');
    expect(badge.classList).toContain('card__severity--long');
  });

  it('opens NVD with referenceId (not the uniqueness-suffixed display id)', () => {
    const openSpy = spyOn(window, 'open');
    (el.querySelector('[aria-label="Open reference"]') as HTMLButtonElement).click();
    expect(openSpy).toHaveBeenCalledWith(
      'https://nvd.nist.gov/vuln/detail/CVE-2023-35116',
      '_blank',
      'noopener',
    );
  });

  it('opens the CWE definition page from the CWE button', () => {
    const openSpy = spyOn(window, 'open');
    fixture.componentRef.setInput('expanded', true);
    fixture.detectChanges();
    (el.querySelector('[aria-label="Open CWE reference"]') as HTMLButtonElement).click();
    expect(openSpy).toHaveBeenCalledWith(
      'https://cwe.mitre.org/data/definitions/770.html',
      '_blank',
      'noopener',
    );
  });

  it('drives severity color from SeverityParams through a CSS custom property', () => {
    const card = el.querySelector('.card') as HTMLElement;
    // SeverityParams.medium.color
    expect(card.style.getPropertyValue('--sev-color')).toBe('#F5B40E');
  });

  it('shows the DISPUTED badge and the EPSS percentage (0.31 → 31%)', () => {
    expect(el.querySelector('img[alt="Disputed"]')).toBeTruthy();
    expect(el.querySelector('.pill--epss')?.textContent).toContain('31%');
  });

  it('hides the CVSS pill when cvss is null', () => {
    fixture.componentRef.setInput('data', { ...mockCard, cvss: null });
    fixture.detectChanges();
    expect(el.querySelector('.pill--cvss')).toBeNull();
  });

  it('emits toggle with the next expanded state when the chevron is clicked', () => {
    let emitted: boolean | undefined;
    fixture.componentInstance.toggle.subscribe((value) => (emitted = value));
    (el.querySelector('.card__chevron') as HTMLButtonElement).click();
    expect(emitted).toBe(true);
  });

  it('renders the Description and CWE sections only when expanded', () => {
    expect(el.querySelector('.card__expanded')).toBeNull();
    fixture.componentRef.setInput('expanded', true);
    fixture.detectChanges();
    expect(el.querySelector('.section--desc')).toBeTruthy();
    expect(el.querySelector('.section--cwe')?.textContent).toContain('CWE-770');
  });

  it('clamps the description until its toggle is clicked', () => {
    fixture.componentRef.setInput('expanded', true);
    fixture.detectChanges();
    const body = () => el.querySelector('.section__body') as HTMLElement;
    expect(body().classList).toContain('section__body--clamped');

    (el.querySelector('.section__toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(body().classList).not.toContain('section__body--clamped');
  });
});
