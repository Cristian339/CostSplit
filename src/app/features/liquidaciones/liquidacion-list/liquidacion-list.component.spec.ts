import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LiquidacionListComponent } from './liquidacion-list.component';

describe('LiquidacionListComponent', () => {
  let component: LiquidacionListComponent;
  let fixture: ComponentFixture<LiquidacionListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LiquidacionListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LiquidacionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
