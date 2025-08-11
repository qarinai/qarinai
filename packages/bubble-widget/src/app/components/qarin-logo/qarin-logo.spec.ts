import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QarinLogo } from './qarin-logo';

describe('QarinLogo', () => {
  let component: QarinLogo;
  let fixture: ComponentFixture<QarinLogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QarinLogo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QarinLogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
