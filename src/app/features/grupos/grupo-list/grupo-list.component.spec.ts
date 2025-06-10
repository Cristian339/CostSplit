import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GrupoListComponent } from './grupo-list.component';

describe('GrupoListComponent', () => {
  let component: GrupoListComponent;
  let fixture: ComponentFixture<GrupoListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GrupoListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GrupoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
