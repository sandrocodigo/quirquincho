import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoItemsComponent } from './ingreso-items.component';

describe('IngresoItemsComponent', () => {
  let component: IngresoItemsComponent;
  let fixture: ComponentFixture<IngresoItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresoItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresoItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
