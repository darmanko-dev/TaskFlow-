import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LabelService } from './label.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Label, LabelRequest } from '../models/label.model';

describe('LabelService', () => {
  let service: LabelService;
  let httpMock: HttpTestingController;

  const mockLabels: Label[] = [
    { id: 1, name: 'Bug', color: '#ff0000', projectId: 1, taskCount: 5 },
    { id: 2, name: 'Feature', color: '#00ff00', projectId: 1, taskCount: 3 },
    { id: 3, name: 'Enhancement', color: '#0000ff', projectId: 1, taskCount: 2 }
  ];

  const mockLabelRequest: LabelRequest = {
    name: 'New Label',
    color: '#ff9900',
    projectId: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LabelService]
    });
    service = TestBed.inject(LabelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjectLabels', () => {
    it('should make a GET request to the correct endpoint', () => {
      const projectId = 1;

      service.getProjectLabels(projectId).subscribe();

      const req = httpMock.expectOne(API_ENDPOINTS.labels.byProject(projectId));
      expect(req.request.method).toBe('GET');
      req.flush(mockLabels);
    });

    it('should return the labels for a given project', () => {
      const projectId = 1;

      service.getProjectLabels(projectId).subscribe(labels => {
        expect(labels).toEqual(mockLabels);
        expect(labels.length).toBe(3);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.labels.byProject(projectId));
      req.flush(mockLabels);
    });

    it('should use the correct project-specific URL for different project IDs', () => {
      service.getProjectLabels(5).subscribe();
      const req5 = httpMock.expectOne(API_ENDPOINTS.labels.byProject(5));
      expect(req5.request.url).toContain('/labels/project/5');
      req5.flush([]);

      service.getProjectLabels(100).subscribe();
      const req100 = httpMock.expectOne(API_ENDPOINTS.labels.byProject(100));
      expect(req100.request.url).toContain('/labels/project/100');
      req100.flush([]);
    });

    it('should handle an empty labels array', () => {
      service.getProjectLabels(999).subscribe(labels => {
        expect(labels).toEqual([]);
        expect(labels.length).toBe(0);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.labels.byProject(999));
      req.flush([]);
    });
  });

  describe('createLabel', () => {
    it('should make a POST request to the labels base endpoint', () => {
      service.createLabel(mockLabelRequest).subscribe();

      const req = httpMock.expectOne(API_ENDPOINTS.labels.base);
      expect(req.request.method).toBe('POST');
      req.flush({ id: 4, ...mockLabelRequest, taskCount: 0 });
    });

    it('should send the label request data in the body', () => {
      service.createLabel(mockLabelRequest).subscribe();

      const req = httpMock.expectOne(API_ENDPOINTS.labels.base);
      expect(req.request.body).toEqual(mockLabelRequest);
      req.flush({ id: 4, ...mockLabelRequest, taskCount: 0 });
    });

    it('should return the created label from the server', () => {
      const expectedResponse: Label = { id: 4, ...mockLabelRequest, taskCount: 0 };

      service.createLabel(mockLabelRequest).subscribe(label => {
        expect(label).toEqual(expectedResponse);
        expect(label.id).toBe(4);
        expect(label.name).toBe('New Label');
      });

      const req = httpMock.expectOne(API_ENDPOINTS.labels.base);
      req.flush(expectedResponse);
    });
  });

  describe('updateLabel', () => {
    it('should make a PUT request to the correct label endpoint', () => {
      const labelId = 1;
      const updateRequest: LabelRequest = { name: 'Updated Bug', color: '#cc0000', projectId: 1 };

      service.updateLabel(labelId, updateRequest).subscribe();

      const req = httpMock.expectOne(API_ENDPOINTS.labels.byId(labelId));
      expect(req.request.method).toBe('PUT');
      req.flush({ id: labelId, ...updateRequest, taskCount: 5 });
    });

    it('should send the updated label data in the body', () => {
      const updateRequest: LabelRequest = { name: 'Updated', color: '#000000', projectId: 2 };

      service.updateLabel(1, updateRequest).subscribe();

      const req = httpMock.expectOne(API_ENDPOINTS.labels.byId(1));
      expect(req.request.body).toEqual(updateRequest);
      req.flush({ id: 1, ...updateRequest, taskCount: 0 });
    });

    it('should return the updated label from the server', () => {
      const updateRequest: LabelRequest = { name: 'Renamed', color: '#abcdef', projectId: 1 };
      const expectedResponse: Label = { id: 2, ...updateRequest, taskCount: 3 };

      service.updateLabel(2, updateRequest).subscribe(label => {
        expect(label).toEqual(expectedResponse);
        expect(label.name).toBe('Renamed');
      });

      const req = httpMock.expectOne(API_ENDPOINTS.labels.byId(2));
      req.flush(expectedResponse);
    });
  });

  describe('deleteLabel', () => {
    it('should make a DELETE request to the correct label endpoint', () => {
      const labelId = 1;

      service.deleteLabel(labelId).subscribe();

      const req = httpMock.expectOne(API_ENDPOINTS.labels.byId(labelId));
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should use the correct URL for the given label ID', () => {
      service.deleteLabel(42).subscribe();

      const req = httpMock.expectOne(API_ENDPOINTS.labels.byId(42));
      expect(req.request.url).toContain('/labels/42');
      req.flush(null);
    });

    it('should complete successfully on a 200 response', () => {
      let completed = false;

      service.deleteLabel(3).subscribe({
        next: () => { completed = true; },
        error: () => fail('Should not error')
      });

      const req = httpMock.expectOne(API_ENDPOINTS.labels.byId(3));
      req.flush(null);

      expect(completed).toBeTrue();
    });

    it('should propagate HTTP errors', () => {
      let errorResponse: any;

      service.deleteLabel(999).subscribe({
        next: () => fail('Should not succeed'),
        error: (err) => { errorResponse = err; }
      });

      const req = httpMock.expectOne(API_ENDPOINTS.labels.byId(999));
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorResponse).toBeTruthy();
      expect(errorResponse.status).toBe(404);
    });
  });
});
