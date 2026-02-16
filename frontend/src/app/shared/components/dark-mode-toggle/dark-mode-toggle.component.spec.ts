import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DarkModeToggleComponent } from './dark-mode-toggle.component';
import { ThemeService } from '../../../core/services/theme.service';
import { BehaviorSubject } from 'rxjs';

describe('DarkModeToggleComponent', () => {
  let component: DarkModeToggleComponent;
  let fixture: ComponentFixture<DarkModeToggleComponent>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;
  let darkModeSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    darkModeSubject = new BehaviorSubject<boolean>(false);
    themeServiceSpy = jasmine.createSpyObj('ThemeService', ['toggleDarkMode', 'isDarkMode'], {
      darkMode$: darkModeSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [DarkModeToggleComponent]
    })
    .overrideComponent(DarkModeToggleComponent, {
      set: {
        providers: [{ provide: ThemeService, useValue: themeServiceSpy }]
      }
    })
    .compileComponents();

    // Override the root-level provider so the component's constructor injection works
    TestBed.overrideProvider(ThemeService, { useValue: themeServiceSpy });

    fixture = TestBed.createComponent(DarkModeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isDark to false by default', () => {
    expect(component.isDark).toBeFalse();
  });

  describe('dark mode subscription', () => {
    it('should update isDark to true when ThemeService emits true', () => {
      darkModeSubject.next(true);
      fixture.detectChanges();

      expect(component.isDark).toBeTrue();
    });

    it('should update isDark to false when ThemeService emits false', () => {
      darkModeSubject.next(true);
      fixture.detectChanges();
      expect(component.isDark).toBeTrue();

      darkModeSubject.next(false);
      fixture.detectChanges();
      expect(component.isDark).toBeFalse();
    });

    it('should track multiple theme changes', () => {
      darkModeSubject.next(true);
      expect(component.isDark).toBeTrue();

      darkModeSubject.next(false);
      expect(component.isDark).toBeFalse();

      darkModeSubject.next(true);
      expect(component.isDark).toBeTrue();
    });
  });

  describe('toggle button', () => {
    it('should render a button element', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('should call ThemeService.toggleDarkMode when the button is clicked', () => {
      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(themeServiceSpy.toggleDarkMode).toHaveBeenCalledTimes(1);
    });

    it('should call ThemeService.toggleDarkMode when toggle() method is called directly', () => {
      component.toggle();
      expect(themeServiceSpy.toggleDarkMode).toHaveBeenCalledTimes(1);
    });

    it('should call toggleDarkMode on each click', () => {
      const button = fixture.nativeElement.querySelector('button');
      button.click();
      button.click();
      button.click();

      expect(themeServiceSpy.toggleDarkMode).toHaveBeenCalledTimes(3);
    });
  });

  describe('icon display', () => {
    it('should show the moon icon (fa-moon) when not in dark mode', () => {
      darkModeSubject.next(false);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('i');
      expect(icon.classList.contains('fa-moon')).toBeTrue();
      expect(icon.classList.contains('fa-sun')).toBeFalse();
    });

    it('should show the sun icon (fa-sun) when in dark mode', () => {
      darkModeSubject.next(true);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('i');
      expect(icon.classList.contains('fa-sun')).toBeTrue();
      expect(icon.classList.contains('fa-moon')).toBeFalse();
    });

    it('should toggle the icon class when dark mode state changes', () => {
      darkModeSubject.next(false);
      fixture.detectChanges();
      let icon = fixture.nativeElement.querySelector('i');
      expect(icon.classList.contains('fa-moon')).toBeTrue();

      darkModeSubject.next(true);
      fixture.detectChanges();
      icon = fixture.nativeElement.querySelector('i');
      expect(icon.classList.contains('fa-sun')).toBeTrue();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from the theme observable on destroy', () => {
      expect(component.isDark).toBeFalse();

      component.ngOnDestroy();

      // After destroy, further emissions should not update the component
      darkModeSubject.next(true);
      expect(component.isDark).toBeFalse();
    });
  });
});
