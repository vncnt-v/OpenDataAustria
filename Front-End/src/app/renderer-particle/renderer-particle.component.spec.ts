import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendererParticleComponent } from './renderer-particle.component';

describe('RendererParticleComponent', () => {
  let component: RendererParticleComponent;
  let fixture: ComponentFixture<RendererParticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RendererParticleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RendererParticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
