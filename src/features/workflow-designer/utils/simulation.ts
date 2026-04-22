import type {
  PersistentWorkflowNodeData,
  SimulationResponse,
  SimulationStep,
  WorkflowPayload,
  WorkflowPayloadNode,
} from '../types/workflow.ts'
import { getNodeLabel, toPersistentNodeData } from './workflow.ts'

function buildMaps(workflow: WorkflowPayload) {
  const nodeMap = new Map(workflow.nodes.map((node) => [node.id, node]))
  const outgoing = new Map<string, string[]>()
  const indegree = new Map<string, number>()

  for (const node of workflow.nodes) {
    outgoing.set(node.id, [])
    indegree.set(node.id, 0)
  }

  for (const edge of workflow.edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      continue
    }

    outgoing.get(edge.source)?.push(edge.target)
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
  }

  return { nodeMap, outgoing, indegree }
}

function compareNodePosition(a: WorkflowPayloadNode, b: WorkflowPayloadNode) {
  if (a.position.x !== b.position.x) {
    return a.position.x - b.position.x
  }

  return a.position.y - b.position.y
}

function describeStep(data: PersistentWorkflowNodeData): string {
  switch (data.kind) {
    case 'start':
      return `Workflow started with ${data.metadata.length} metadata field(s).`
    case 'task':
      return `Task assigned to ${data.assignee || 'unassigned owner'}${
        data.dueDate ? ` and due ${data.dueDate}` : ''
      }.`
    case 'approval':
      return `Approval routed to ${data.approverRole}${
        data.autoApproveThreshold !== null
          ? ` with threshold ${data.autoApproveThreshold}.`
          : '.'
      }`
    case 'automated': {
      const params = Object.entries(data.actionParams)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')

      return `${data.actionLabel || 'Automation'} executed${
        params ? ` with ${params}.` : '.'
      }`
    }
    case 'end':
      return data.summary
        ? `${data.endMessage} Summary sent to workflow owner.`
        : data.endMessage
  }
}

function buildExecutionPlan(workflow: WorkflowPayload) {
  const { nodeMap, outgoing, indegree } = buildMaps(workflow)
  const ready = workflow.nodes
    .filter((node) => (indegree.get(node.id) ?? 0) === 0)
    .sort(compareNodePosition)
  const ordered: WorkflowPayloadNode[] = []

  while (ready.length > 0) {
    const current = ready.shift()

    if (!current) {
      continue
    }

    ordered.push(current)

    for (const nextId of outgoing.get(current.id) ?? []) {
      const nextNode = nodeMap.get(nextId)

      if (!nextNode) {
        continue
      }

      indegree.set(nextId, (indegree.get(nextId) ?? 1) - 1)

      if ((indegree.get(nextId) ?? 0) === 0) {
        ready.push(nextNode)
        ready.sort(compareNodePosition)
      }
    }
  }

  return ordered
}

function buildSimulationStep(node: WorkflowPayloadNode, index: number): SimulationStep {
  const data = toPersistentNodeData(node.data)

  return {
    id: `step-${index + 1}`,
    nodeId: node.id,
    nodeLabel: getNodeLabel(data),
    status: data.kind === 'approval' ? 'warning' : 'success',
    message: describeStep(data),
  }
}

export function runWorkflowSimulation(
  workflow: WorkflowPayload,
): SimulationResponse {
  const startedAt = new Date().toISOString()
  const executionPlan = buildExecutionPlan(workflow)
  const steps = executionPlan.map((node, index) =>
    buildSimulationStep(node, index),
  )
  const finishedAt = new Date().toISOString()

  return {
    status: 'success',
    startedAt,
    finishedAt,
    summary: `${steps.length} step(s) executed across ${workflow.nodes.length} node(s).`,
    steps,
  }
}
