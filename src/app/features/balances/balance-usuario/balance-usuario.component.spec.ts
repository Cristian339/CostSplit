import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BalanceUsuarioComponent } from './balance-usuario.component';

describe('BalanceUsuarioComponent', () => {
  let component: BalanceUsuarioComponent;
  let fixture: ComponentFixture<BalanceUsuarioComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BalanceUsuarioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BalanceUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
