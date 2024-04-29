import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsSlideComponent } from './contacts-slide.component';

describe('ContactsSlideComponent', () => {
  let component: ContactsSlideComponent;
  let fixture: ComponentFixture<ContactsSlideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactsSlideComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactsSlideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
