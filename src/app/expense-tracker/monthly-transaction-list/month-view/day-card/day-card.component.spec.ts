import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayCardComponent } from './day-card.component';

describe('DayCardComponent', () => {
  let component: DayCardComponent;
  let fixture: ComponentFixture<DayCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DayCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
