import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TreeChartComponent } from './tree-chart.component';

describe('TreeChartComponent', () => {
  let component: TreeChartComponent;
  let fixture: ComponentFixture<TreeChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeChartComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TreeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders an svg once the view has rendered', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg.tree-svg')).toBeTruthy();
  });

  it('applies model modifiers that match the TreeNode model values', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.tree-card');
    const modifiers = Array.from(cards as NodeListOf<Element>).flatMap((card) =>
      Array.from(card.classList).filter((c) => c.startsWith('tree-card--')),
    );
    expect(modifiers.length).toBeGreaterThan(0);
    expect(modifiers).toContain('tree-card--assetList');
  });

  it('renders circular toggle controls outside the card', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const toggles = fixture.nativeElement.querySelectorAll('g.tree-toggle');
    expect(toggles.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('.tree-card__chevron')).toBeNull();
    // Must receive clicks (bubbles to the node handler).
    expect((toggles[0] as SVGElement).getAttribute('pointer-events')).not.toBe('none');
  });
});
