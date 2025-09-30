import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reporte8Component } from './reporte8.component';

describe('Reporte8Component', () => {
  let component: Reporte8Component;
  let fixture: ComponentFixture<Reporte8Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reporte8Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reporte8Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
