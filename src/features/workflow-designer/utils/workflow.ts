import type { XYPosition } from '@xyflow/react'

import type {
  DesignerEdge,
  DesignerNode,
  EndNodeData,
  KeyValuePair,
  PersistentWorkflowNodeData,
  WorkflowNodeData,
  WorkflowNodeType,
  WorkflowPayload,
} from '../types/workflow.ts'

export function createKeyValuePair(): KeyValuePair {
  return {
    id: crypto.randomUUID(),
    key: '',
    value: '',
  }
}

export function createNodeData(
  type: WorkflowNodeType,
): PersistentWorkflowNodeData {
  switch (type) {
    case 'start':
      return {
        kind: 'start',
        title: 'New workflow',
        metadata: [],
      }
    case 'task':
      return {
        kind: 'task',
        title: 'Collect documents',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      }
    case 'approval':
      return {
        kind: 'approval',
        title: 'Approval gate',
        approverRole: 'Manager',
        autoApproveThreshold: null,
      }
    case 'automated':
      return {
        kind: 'automated',
        title: 'Automated action',
        actionId: '',
        actionLabel: '',
        actionParams: {},
      }
    case 'end':
      return {
        kind: 'end',
        endMessage: 'Workflow complete',
        summary: true,
      } satisfies EndNodeData
  }
}

export function createWorkflowNode(
  type: WorkflowNodeType,
  position: XYPosition,
): DesignerNode {
  return {
    id: `${type}-${crypto.randomUUID().slice(0, 8)}`,
    type,
    position,
    data: createNodeData(type),
  }
}

export function toPersistentNodeData(
  data: WorkflowNodeData | PersistentWorkflowNodeData,
): PersistentWorkflowNodeData {
  switch (data.kind) {
    case 'start':
      return {
        kind: 'start',
        title: data.title,
        metadata: data.metadata.map((pair) => ({ ...pair })),
      }
    case 'task':
      return {
        kind: 'task',
        title: data.title,
        description: data.description,
        assignee: data.assignee,
        dueDate: data.dueDate,
        customFields: data.customFields.map((pair) => ({ ...pair })),
      }
    case 'approval':
      return {
        kind: 'approval',
        title: data.title,
        approverRole: data.approverRole,
        autoApproveThreshold: data.autoApproveThreshold,
      }
    case 'automated':
      return {
        kind: 'automated',
        title: data.title,
        actionId: data.actionId,
        actionLabel: data.actionLabel,
        actionParams: { ...data.actionParams },
      }
    case 'end':
      return {
        kind: 'end',
        endMessage: data.endMessage,
        summary: data.summary,
      }
  }
}

export function serializeWorkflow(
  nodes: Array<Pick<DesignerNode, 'id' | 'type' | 'position' | 'data'>>,
  edges: Array<Pick<DesignerEdge, 'id' | 'source' | 'target'>>,
): WorkflowPayload {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: { ...node.position },
      data: toPersistentNodeData(node.data),
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })),
  }
}

export function getNodeLabel(
  data: WorkflowNodeData | PersistentWorkflowNodeData,
): string {
  switch (data.kind) {
    case 'start':
    case 'task':
    case 'approval':
    case 'automated':
      return data.title.trim() || 'Untitled step'
    case 'end':
      return data.endMessage.trim() || 'Workflow complete'
  }
}
