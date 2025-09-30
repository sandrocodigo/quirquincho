import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenTemporalComponent } from './orden-temporal.component';

describe('OrdenTemporalComponent', () => {
  let component: OrdenTemporalComponent;
  let fixture: ComponentFixture<OrdenTemporalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenTemporalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenTemporalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
