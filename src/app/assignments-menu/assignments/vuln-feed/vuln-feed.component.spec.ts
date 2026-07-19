import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { VulnFeedComponent } from './vuln-feed.component';
import { vulnFeedReducer } from './vuln-feed-state/vuln-feed.reducer';
import { VulnFeedFeatureKey } from './vuln-feed-state/vuln-feed.state';

describe('VulnFeedComponent', () => {
  let component: VulnFeedComponent;
  let fixture: ComponentFixture<VulnFeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VulnFeedComponent],
      providers: [
        provideRouter([]),
        provideStore({ [VulnFeedFeatureKey]: vulnFeedReducer }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VulnFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
