import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicestationsComponent } from './policestations.component';

describe('PolicestationsComponent', () => {
  let component: PolicestationsComponent;
  let fixture: ComponentFixture<PolicestationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolicestationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicestationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
