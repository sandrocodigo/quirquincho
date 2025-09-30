import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reporte7Component } from './reporte7.component';

describe('Reporte7Component', () => {
  let component: Reporte7Component;
  let fixture: ComponentFixture<Reporte7Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reporte7Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reporte7Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
