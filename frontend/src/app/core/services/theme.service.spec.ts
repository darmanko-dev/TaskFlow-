import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to light mode when no localStorage value exists', () => {
    expect(service.isDarkMode()).toBeFalse();
  });

  it('should expose darkMode$ observable that emits the current state', (done) => {
    service.darkMode$.subscribe(isDark => {
      expect(typeof isDark).toBe('boolean');
      done();
    });
  });

  describe('toggleDarkMode', () => {
    it('should enable dark mode when currently in light mode', () => {
      expect(service.isDarkMode()).toBeFalse();

      service.toggleDarkMode();

      expect(service.isDarkMode()).toBeTrue();
    });

    it('should disable dark mode when currently in dark mode', () => {
      service.enableDarkMode();
      expect(service.isDarkMode()).toBeTrue();

      service.toggleDarkMode();

      expect(service.isDarkMode()).toBeFalse();
    });

    it('should toggle the dark class on document.documentElement', () => {
      service.toggleDarkMode();
      expect(document.documentElement.classList.contains('dark')).toBeTrue();

      service.toggleDarkMode();
      expect(document.documentElement.classList.contains('dark')).toBeFalse();
    });
  });

  describe('enableDarkMode', () => {
    it('should set isDarkMode to true', () => {
      service.enableDarkMode();
      expect(service.isDarkMode()).toBeTrue();
    });

    it('should add "dark" class to document.documentElement', () => {
      service.enableDarkMode();
      expect(document.documentElement.classList.contains('dark')).toBeTrue();
    });

    it('should persist "true" in localStorage under "darkMode" key', () => {
      service.enableDarkMode();
      expect(localStorage.getItem('darkMode')).toBe('true');
    });

    it('should emit true through darkMode$ observable', (done) => {
      service.enableDarkMode();
      service.darkMode$.subscribe(isDark => {
        expect(isDark).toBeTrue();
        done();
      });
    });
  });

  describe('disableDarkMode', () => {
    it('should set isDarkMode to false', () => {
      service.enableDarkMode();
      service.disableDarkMode();
      expect(service.isDarkMode()).toBeFalse();
    });

    it('should remove "dark" class from document.documentElement', () => {
      service.enableDarkMode();
      expect(document.documentElement.classList.contains('dark')).toBeTrue();

      service.disableDarkMode();
      expect(document.documentElement.classList.contains('dark')).toBeFalse();
    });

    it('should persist "false" in localStorage under "darkMode" key', () => {
      service.disableDarkMode();
      expect(localStorage.getItem('darkMode')).toBe('false');
    });
  });

  describe('isDarkMode', () => {
    it('should return false initially', () => {
      expect(service.isDarkMode()).toBeFalse();
    });

    it('should return true after enabling dark mode', () => {
      service.enableDarkMode();
      expect(service.isDarkMode()).toBeTrue();
    });

    it('should return false after enabling then disabling dark mode', () => {
      service.enableDarkMode();
      service.disableDarkMode();
      expect(service.isDarkMode()).toBeFalse();
    });
  });

  describe('persistence via localStorage', () => {
    it('should restore dark mode from localStorage on construction', () => {
      localStorage.setItem('darkMode', 'true');

      const freshService = new ThemeService();

      expect(freshService.isDarkMode()).toBeTrue();
      expect(document.documentElement.classList.contains('dark')).toBeTrue();
    });

    it('should not enable dark mode when localStorage value is "false"', () => {
      localStorage.setItem('darkMode', 'false');

      const freshService = new ThemeService();

      expect(freshService.isDarkMode()).toBeFalse();
    });

    it('should not enable dark mode when localStorage has no value', () => {
      localStorage.removeItem('darkMode');

      const freshService = new ThemeService();

      expect(freshService.isDarkMode()).toBeFalse();
    });
  });
});
