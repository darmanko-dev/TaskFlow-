export interface AutomationRule {
  id: number;
  name: string;
  description: string;
  triggerType: string;
  triggerConfig: string;
  actionType: string;
  actionConfig: string;
  projectId: number;
  enabled: boolean;
  createdAt: string;
}

export interface AutomationRuleRequest {
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: string;
  actionType: string;
  actionConfig: string;
  projectId: number;
  enabled: boolean;
}
