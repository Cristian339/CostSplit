import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GastoFilterComponent } from './gasto-filter.component';

describe('GastoFilterComponent', () => {
  let component: GastoFilterComponent;
  let fixture: ComponentFixture<GastoFilterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GastoFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GastoFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
