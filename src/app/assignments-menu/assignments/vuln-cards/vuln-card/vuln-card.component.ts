import { DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SeverityParams } from '../vuln-cards-mock-data';
import { VulnCard } from '../vuln-cards-models';
import { PLUS_ICON, VULN_ICON } from './vuln-icons';

@Component({
  selector: 'app-vuln-card',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vuln-card.component.html',
  styleUrl: './vuln-card.component.scss',
})
export class VulnCardComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly data = input.required<VulnCard>();
  readonly expanded = input(false);
  readonly toggle = output<boolean>();

  protected readonly icon = VULN_ICON;
  protected readonly plusIcon: SafeHtml =
    this.sanitizer.bypassSecurityTrustHtml(PLUS_ICON);

  protected readonly severity = computed(() => this.data().severity);
  protected readonly severityColor = computed(
    () =>
      SeverityParams[this.severity()]?.color ??
      'var(--cb-color-vulnerability-na)',
  );
  protected readonly severityLetter = computed(
    () =>
      SeverityParams[this.severity()]?.abbr ??
      this.severity().charAt(0).toUpperCase(),
  );
  protected readonly source = computed(
    () => this.data().mappingSources[0]?.toLowerCase() ?? '',
  );
  protected readonly sourceIconUrl = computed(() =>
    this.source() ? `vuln-card-images/${this.source()}-icon-new.svg` : '',
  );
  protected readonly primaryComponent = computed(
    () => this.data().components[0] ?? null,
  );
  protected readonly epssPercent = computed(() => {
    const epss = this.data().epss;
    return epss === null ? null : Math.round(epss * 100);
  });

  // Reset when cdkVirtualFor recycles this view onto another card.
  protected readonly descriptionExpanded = linkedSignal({
    source: this.data,
    computation: () => false,
  });

  protected onToggle(): void {
    this.toggle.emit(!this.expanded());
  }

  protected toggleDescription(): void {
    this.descriptionExpanded.update((expanded) => !expanded);
  }

  protected async copyId(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(this.data().id);
    } catch {
      // Clipboard permissions can be denied; a copy button shouldn't crash the card.
    }
  }

  protected openReference(): void {
    window.open(
      `https://nvd.nist.gov/vuln/detail/${this.data().referenceId}`,
      '_blank',
      'noopener',
    );
  }

  protected openCwe(cweId: string): void {
    const number = cweId.replace(/^CWE-/i, '');
    window.open(
      `https://cwe.mitre.org/data/definitions/${number}.html`,
      '_blank',
      'noopener',
    );
  }
}
