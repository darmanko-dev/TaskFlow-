import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExportService } from './export.service';
import { API_ENDPOINTS } from '../constants/api.constants';

describe('ExportService', () => {
  let service: ExportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExportService]
    });
    service = TestBed.inject(ExportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportAllTasksCSV', () => {
    it('should make a GET request to the allTasksCsv endpoint', () => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      spyOn(URL, 'revokeObjectURL');

      service.exportAllTasksCSV();

      const req = httpMock.expectOne(API_ENDPOINTS.export.allTasksCsv);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');

      req.flush(new Blob(['task1,task2'], { type: 'text/csv' }));
    });

    it('should call downloadBlob with the correct filename "tasks.csv"', () => {
      const mockBlob = new Blob(['id,name\n1,Test Task'], { type: 'text/csv' });
      const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
      const createElementSpy = spyOn(document, 'createElement').and.callThrough();

      service.exportAllTasksCSV();

      const req = httpMock.expectOne(API_ENDPOINTS.export.allTasksCsv);
      req.flush(mockBlob);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should create an anchor element and trigger a download', () => {
      const mockBlob = new Blob(['data'], { type: 'text/csv' });
      spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      spyOn(URL, 'revokeObjectURL');

      let createdAnchor: HTMLAnchorElement | null = null;
      const originalCreateElement = document.createElement.bind(document);
      spyOn(document, 'createElement').and.callFake((tag: string) => {
        const el = originalCreateElement(tag);
        if (tag === 'a') {
          createdAnchor = el as HTMLAnchorElement;
          spyOn(createdAnchor, 'click');
        }
        return el;
      });

      service.exportAllTasksCSV();

      const req = httpMock.expectOne(API_ENDPOINTS.export.allTasksCsv);
      req.flush(mockBlob);

      expect(createdAnchor).toBeTruthy();
      expect(createdAnchor!.href).toContain('blob:mock-url');
      expect(createdAnchor!.download).toBe('tasks.csv');
      expect(createdAnchor!.click).toHaveBeenCalled();
    });
  });

  describe('exportProjectTasksCSV', () => {
    it('should make a GET request to the projectTasksCsv endpoint with the project ID', () => {
      const projectId = 42;
      spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      spyOn(URL, 'revokeObjectURL');

      service.exportProjectTasksCSV(projectId);

      const req = httpMock.expectOne(API_ENDPOINTS.export.projectTasksCsv(projectId));
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');

      req.flush(new Blob(['data'], { type: 'text/csv' }));
    });

    it('should use the correct URL for different project IDs', () => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      spyOn(URL, 'revokeObjectURL');

      service.exportProjectTasksCSV(1);
      const req1 = httpMock.expectOne(API_ENDPOINTS.export.projectTasksCsv(1));
      req1.flush(new Blob(['data']));

      service.exportProjectTasksCSV(99);
      const req2 = httpMock.expectOne(API_ENDPOINTS.export.projectTasksCsv(99));
      req2.flush(new Blob(['data']));
    });

    it('should download the blob with filename "project-tasks.csv"', () => {
      const mockBlob = new Blob(['project data'], { type: 'text/csv' });
      spyOn(URL, 'createObjectURL').and.returnValue('blob:project-url');
      spyOn(URL, 'revokeObjectURL');

      let createdAnchor: HTMLAnchorElement | null = null;
      const originalCreateElement = document.createElement.bind(document);
      spyOn(document, 'createElement').and.callFake((tag: string) => {
        const el = originalCreateElement(tag);
        if (tag === 'a') {
          createdAnchor = el as HTMLAnchorElement;
          spyOn(createdAnchor, 'click');
        }
        return el;
      });

      service.exportProjectTasksCSV(5);

      const req = httpMock.expectOne(API_ENDPOINTS.export.projectTasksCsv(5));
      req.flush(mockBlob);

      expect(createdAnchor).toBeTruthy();
      expect(createdAnchor!.download).toBe('project-tasks.csv');
      expect(createdAnchor!.click).toHaveBeenCalled();
    });

    it('should revoke the object URL after triggering download', () => {
      const mockBlob = new Blob(['data'], { type: 'text/csv' });
      spyOn(URL, 'createObjectURL').and.returnValue('blob:revoke-test');
      const revokeSpy = spyOn(URL, 'revokeObjectURL');

      service.exportProjectTasksCSV(10);

      const req = httpMock.expectOne(API_ENDPOINTS.export.projectTasksCsv(10));
      req.flush(mockBlob);

      expect(revokeSpy).toHaveBeenCalledWith('blob:revoke-test');
    });
  });
});
