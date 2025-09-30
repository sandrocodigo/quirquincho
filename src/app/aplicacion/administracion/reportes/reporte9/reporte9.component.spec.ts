import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reporte9Component } from './reporte9.component';

describe('Reporte9Component', () => {
  let component: Reporte9Component;
  let fixture: ComponentFixture<Reporte9Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reporte9Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reporte9Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
