import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GrupoDetailComponent } from './grupo-detail.component';

describe('GrupoDetailComponent', () => {
  let component: GrupoDetailComponent;
  let fixture: ComponentFixture<GrupoDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GrupoDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GrupoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
