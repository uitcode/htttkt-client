import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartFourMComponent } from './chart-four-m.component';

describe('ChartFourMComponent', () => {
  let component: ChartFourMComponent;
  let fixture: ComponentFixture<ChartFourMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartFourMComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartFourMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
