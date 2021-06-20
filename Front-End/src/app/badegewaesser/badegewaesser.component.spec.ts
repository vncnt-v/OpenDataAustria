import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadegewaesserComponent } from './badegewaesser.component';

describe('BadegewaesserComponent', () => {
  let component: BadegewaesserComponent;
  let fixture: ComponentFixture<BadegewaesserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadegewaesserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadegewaesserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
