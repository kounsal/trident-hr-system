import type { Edge, Node, XYPosition } from '@xyflow/react'

export const workflowNodeTypes = [
  'start',
  'task',
  'approval',
  'automated',
  'end',
] as const

export type WorkflowNodeType = (typeof workflowNodeTypes)[number]

export interface KeyValuePair {
  id: string
  key: string
  value: string
}

export interface StartNodeData extends Record<string, unknown> {
  kind: 'start'
  title: string
  metadata: KeyValuePair[]
}

export interface TaskNodeData extends Record<string, unknown> {
  kind: 'task'
  title: string
  description: string
  assignee: string
  dueDate: string
  customFields: KeyValuePair[]
}

export interface ApprovalNodeData extends Record<string, unknown> {
  kind: 'approval'
  title: string
  approverRole: string
  autoApproveThreshold: number | null
}

export interface AutomatedNodeData extends Record<string, unknown> {
  kind: 'automated'
  title: string
  actionId: string
  actionLabel: string
  actionParams: Record<string, string>
}

export interface EndNodeData extends Record<string, unknown> {
  kind: 'end'
  endMessage: string
  summary: boolean
}

export type PersistentWorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData

export interface WorkflowNodeUiState {
  issueCount?: number
  issueSummary?: string[]
}

export type WorkflowNodeData = PersistentWorkflowNodeData & WorkflowNodeUiState

export type DesignerNode = Node<WorkflowNodeData, WorkflowNodeType>
export type DesignerEdge = Edge

export interface WorkflowPayloadNode {
  id: string
  type: WorkflowNodeType
  position: XYPosition
  data: PersistentWorkflowNodeData
}

export interface WorkflowPayloadEdge {
  id: string
  source: string
  target: string
}

export interface WorkflowPayload {
  nodes: WorkflowPayloadNode[]
  edges: WorkflowPayloadEdge[]
}

export interface AutomationAction {
  id: string
  label: string
  params: string[]
  description: string
}

export interface SimulationStep {
  id: string
  nodeId: string
  nodeLabel: string
  status: 'success' | 'warning' | 'info'
  message: string
}

export interface SimulationResponse {
  status: 'success'
  startedAt: string
  finishedAt: string
  summary: string
  steps: SimulationStep[]
}

export interface ValidationIssue {
  id: string
  rule: string
  severity: 'error' | 'warning'
  message: string
  nodeId?: string
  edgeId?: string
}
