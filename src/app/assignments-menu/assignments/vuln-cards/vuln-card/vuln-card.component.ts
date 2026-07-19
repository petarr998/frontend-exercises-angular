import { DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { SeverityParams } from '../vuln-cards-mock-data';
import { VulnCard } from '../vuln-cards-models';

@Component({
  selector: 'app-vuln-card',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vuln-card.component.html',
  styleUrl: './vuln-card.component.scss',
})
export class VulnCardComponent {
  readonly data = input.required<VulnCard>();
  readonly expanded = input(false);
  readonly toggle = output<boolean>();

  protected readonly severity = computed(() => this.data().severity);
  // Severity color comes from the SeverityParams const (per the brief), applied
  // through a CSS custom property so the styling itself stays in SCSS.
  protected readonly severityColor = computed(
    () =>
      SeverityParams[this.severity()]?.color ??
      'var(--cb-color-vulnerability-na)',
  );
  protected readonly severityLetter = computed(() =>
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

  // Whether the expanded description shows in full. Resets when the card is
  // recycled for a different vuln (cdkVirtualFor reuses view instances).
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
      `https://nvd.nist.gov/vuln/detail/${this.data().id}`,
      '_blank',
      'noopener',
    );
  }
}
