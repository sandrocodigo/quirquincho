import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reporte10Component } from './reporte10.component';

describe('Reporte10Component', () => {
  let component: Reporte10Component;
  let fixture: ComponentFixture<Reporte10Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reporte10Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reporte10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
