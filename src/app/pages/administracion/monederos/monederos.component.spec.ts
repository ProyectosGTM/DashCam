import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonederosComponent } from './monederos.component';

describe('MonederosComponent', () => {
  let component: MonederosComponent;
  let fixture: ComponentFixture<MonederosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonederosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonederosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
