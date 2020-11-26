import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UICoronaComponent } from './ui-corona.component';

describe('UICoronaComponent', () => {
  let component: UICoronaComponent;
  let fixture: ComponentFixture<UICoronaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UICoronaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UICoronaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
