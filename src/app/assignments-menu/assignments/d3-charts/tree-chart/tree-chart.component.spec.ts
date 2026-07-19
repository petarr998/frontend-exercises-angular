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
});
