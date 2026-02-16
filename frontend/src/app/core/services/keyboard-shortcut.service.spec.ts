import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { KeyboardShortcutService, Shortcut } from './keyboard-shortcut.service';

describe('KeyboardShortcutService', () => {
  let service: KeyboardShortcutService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        KeyboardShortcutService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(KeyboardShortcutService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('default shortcuts', () => {
    it('should register default shortcuts on construction', () => {
      const shortcuts = service.getShortcuts();
      expect(shortcuts.length).toBeGreaterThanOrEqual(4);
    });

    it('should include a shortcut for navigating to Dashboard (Shift+D)', () => {
      const dashboardShortcut = service.getShortcuts().find(s => s.key === 'd' && s.shiftKey);
      expect(dashboardShortcut).toBeTruthy();
      expect(dashboardShortcut!.description).toContain('Dashboard');
    });

    it('should include a shortcut for navigating to Tasks (Shift+T)', () => {
      const tasksShortcut = service.getShortcuts().find(s => s.key === 't' && s.shiftKey);
      expect(tasksShortcut).toBeTruthy();
      expect(tasksShortcut!.description).toContain('Tasks');
    });

    it('should include a shortcut for navigating to Projects (Shift+P)', () => {
      const projectsShortcut = service.getShortcuts().find(s => s.key === 'p' && s.shiftKey);
      expect(projectsShortcut).toBeTruthy();
      expect(projectsShortcut!.description).toContain('Projects');
    });

    it('should include a shortcut for showing help (?)', () => {
      const helpShortcut = service.getShortcuts().find(s => s.key === '?');
      expect(helpShortcut).toBeTruthy();
      expect(helpShortcut!.description).toContain('keyboard shortcuts');
    });
  });

  describe('showHelp$', () => {
    it('should emit true when the "?" key shortcut action is invoked', (done) => {
      service.showHelp$.subscribe(value => {
        expect(value).toBeTrue();
        done();
      });

      const helpShortcut = service.getShortcuts().find(s => s.key === '?');
      helpShortcut!.action();
    });

    it('should emit when "?" key is pressed via keyboard event', (done) => {
      service.showHelp$.subscribe(value => {
        expect(value).toBeTrue();
        done();
      });

      const event = new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: false,
        ctrlKey: false,
        bubbles: true
      });
      document.dispatchEvent(event);
    });
  });

  describe('keyboard event handling', () => {
    it('should navigate to /dashboard when Shift+D is pressed', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'd',
        shiftKey: true,
        ctrlKey: false,
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to /tasks when Shift+T is pressed', () => {
      const event = new KeyboardEvent('keydown', {
        key: 't',
        shiftKey: true,
        ctrlKey: false,
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('should navigate to /projects when Shift+P is pressed', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'p',
        shiftKey: true,
        ctrlKey: false,
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
    });

    it('should not trigger shortcuts when typing in an input field', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'd',
        shiftKey: true,
        ctrlKey: false,
        bubbles: true
      });
      Object.defineProperty(event, 'target', { value: input });
      document.dispatchEvent(event);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it('should not trigger shortcuts when typing in a textarea', () => {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'd',
        shiftKey: true,
        ctrlKey: false,
        bubbles: true
      });
      Object.defineProperty(event, 'target', { value: textarea });
      document.dispatchEvent(event);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      document.body.removeChild(textarea);
    });
  });

  describe('registerShortcut', () => {
    it('should add a new shortcut to the list', () => {
      const initialLength = service.getShortcuts().length;
      const customShortcut: Shortcut = {
        key: 'x',
        ctrlKey: true,
        shiftKey: false,
        description: 'Custom action',
        action: () => {}
      };

      service.registerShortcut(customShortcut);

      expect(service.getShortcuts().length).toBe(initialLength + 1);
      expect(service.getShortcuts()).toContain(customShortcut);
    });

    it('should trigger custom shortcut action via keyboard event', () => {
      const actionSpy = jasmine.createSpy('customAction');
      service.registerShortcut({
        key: 'z',
        ctrlKey: false,
        shiftKey: false,
        description: 'Test shortcut',
        action: actionSpy
      });

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        shiftKey: false,
        ctrlKey: false,
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(actionSpy).toHaveBeenCalledTimes(1);
    });

    it('should return all registered shortcuts via getShortcuts', () => {
      const shortcuts = service.getShortcuts();
      expect(Array.isArray(shortcuts)).toBeTrue();
      shortcuts.forEach(shortcut => {
        expect(shortcut.key).toBeDefined();
        expect(shortcut.description).toBeDefined();
        expect(shortcut.action).toBeDefined();
      });
    });
  });
});
