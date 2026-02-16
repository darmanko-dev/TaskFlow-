export enum LinkType {
  BLOCKS = 'BLOCKS',
  IS_BLOCKED_BY = 'IS_BLOCKED_BY',
  DUPLICATES = 'DUPLICATES',
  IS_DUPLICATED_BY = 'IS_DUPLICATED_BY',
  RELATES_TO = 'RELATES_TO'
}

export interface TaskLink {
  id: number;
  sourceTaskId: number;
  sourceTaskKey: string;
  sourceTaskTitle: string;
  targetTaskId: number;
  targetTaskKey: string;
  targetTaskTitle: string;
  linkType: LinkType;
  createdAt: string;
}

export interface TaskLinkRequest {
  sourceTaskId: number;
  targetTaskId: number;
  linkType: LinkType;
}
