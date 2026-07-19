import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VulnCardsComponent } from './vuln-cards.component';

describe('VulnCardsComponent', () => {
  let component: VulnCardsComponent;
  let fixture: ComponentFixture<VulnCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VulnCardsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(VulnCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a CDK virtual scroll viewport', () => {
    expect(
      fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport'),
    ).toBeTruthy();
  });
});
