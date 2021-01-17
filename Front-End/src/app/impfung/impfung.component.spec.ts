import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpfungComponent } from './impfung.component';

describe('ImpfungComponent', () => {
  let component: ImpfungComponent;
  let fixture: ComponentFixture<ImpfungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImpfungComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpfungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
