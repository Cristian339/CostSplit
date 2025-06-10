import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GraficosGastosComponent } from './graficos-gastos.component';

describe('GraficosGastosComponent', () => {
  let component: GraficosGastosComponent;
  let fixture: ComponentFixture<GraficosGastosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GraficosGastosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GraficosGastosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
