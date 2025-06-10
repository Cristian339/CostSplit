import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BalanceGeneralComponent } from './balance-general.component';

describe('BalanceGeneralComponent', () => {
  let component: BalanceGeneralComponent;
  let fixture: ComponentFixture<BalanceGeneralComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BalanceGeneralComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BalanceGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
