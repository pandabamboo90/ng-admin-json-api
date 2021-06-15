import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletIdComponent } from './wallet-id.component';

describe('WalletIdComponent', () => {
  let component: WalletIdComponent;
  let fixture: ComponentFixture<WalletIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
