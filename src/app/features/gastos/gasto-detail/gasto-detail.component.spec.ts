import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GastoDetailComponent } from './gasto-detail.component';

describe('GastoDetailComponent', () => {
  let component: GastoDetailComponent;
  let fixture: ComponentFixture<GastoDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GastoDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GastoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
