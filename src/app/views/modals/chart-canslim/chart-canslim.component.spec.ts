import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartCanslimComponent } from './chart-canslim.component';

describe('ChartCanslimComponent', () => {
  let component: ChartCanslimComponent;
  let fixture: ComponentFixture<ChartCanslimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartCanslimComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartCanslimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
