import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GrupoFormComponent } from './grupo-form.component';

describe('GrupoFormComponent', () => {
  let component: GrupoFormComponent;
  let fixture: ComponentFixture<GrupoFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GrupoFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GrupoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
