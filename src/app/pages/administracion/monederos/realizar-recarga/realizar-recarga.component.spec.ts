import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealizarRecargaComponent } from './realizar-recarga.component';

describe('RealizarRecargaComponent', () => {
  let component: RealizarRecargaComponent;
  let fixture: ComponentFixture<RealizarRecargaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealizarRecargaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RealizarRecargaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
