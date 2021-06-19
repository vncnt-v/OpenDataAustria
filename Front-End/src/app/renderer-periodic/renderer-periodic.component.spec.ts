import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendererPeriodicComponent } from './renderer-periodic.component';

describe('RendererPeriodicComponent', () => {
  let component: RendererPeriodicComponent;
  let fixture: ComponentFixture<RendererPeriodicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RendererPeriodicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RendererPeriodicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
