import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AutomationRuleRequest } from '../models/automation.model';

@Injectable({ providedIn: 'root' })
export class AutomationRuleService {
  constructor(private http: HttpClient) {}

  getProjectRules(projectId: number): Observable<any> {
    return this.http.get(API_ENDPOINTS.automations.byProject(projectId));
  }

  createRule(request: AutomationRuleRequest): Observable<any> {
    return this.http.post(API_ENDPOINTS.automations.base, request);
  }

  updateRule(id: number, request: AutomationRuleRequest): Observable<any> {
    return this.http.put(API_ENDPOINTS.automations.byId(id), request);
  }

  toggleRule(id: number, enabled: boolean): Observable<any> {
    return this.http.patch(API_ENDPOINTS.automations.toggle(id), { enabled });
  }

  deleteRule(id: number): Observable<any> {
    return this.http.delete(API_ENDPOINTS.automations.byId(id));
  }
}
