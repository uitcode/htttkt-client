import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartValueComponent } from './chart-value.component';

describe('ChartValueComponent', () => {
  let component: ChartValueComponent;
  let fixture: ComponentFixture<ChartValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
