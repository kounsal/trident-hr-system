import type {
  DesignerEdge,
  DesignerNode,
  PersistentWorkflowNodeData,
  ValidationIssue,
  WorkflowPayloadEdge,
  WorkflowPayloadNode,
} from '../types/workflow.ts'
import { getNodeLabel, toPersistentNodeData } from './workflow.ts'

type GraphNode = DesignerNode | WorkflowPayloadNode
type GraphEdge = DesignerEdge | WorkflowPayloadEdge

function buildGraph(nodes: GraphNode[], edges: GraphEdge[]) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const incoming = new Map<string, string[]>()
  const outgoing = new Map<string, string[]>()

  for (const node of nodes) {
    incoming.set(node.id, [])
    outgoing.set(node.id, [])
  }

  for (const edge of edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      continue
    }

    outgoing.get(edge.source)?.push(edge.target)
    incoming.get(edge.target)?.push(edge.source)
  }

  return { nodeMap, incoming, outgoing }
}

function createIssue(
  rule: string,
  message: string,
  options: Partial<ValidationIssue> = {},
): ValidationIssue {
  return {
    id: `${rule}-${crypto.randomUUID().slice(0, 8)}`,
    rule,
    severity: 'error',
    message,
    ...options,
  }
}

function validateNodeFields(
  nodeId: string,
  data: PersistentWorkflowNodeData,
): ValidationIssue[] {
  switch (data.kind) {
    case 'start':
      return data.title.trim()
        ? []
        : [createIssue('start-title', 'Start node title is required.', { nodeId })]
    case 'task': {
      const issues: ValidationIssue[] = []

      if (!data.title.trim()) {
        issues.push(
          createIssue('task-title', 'Task title is required.', { nodeId }),
        )
      }

      if (!data.assignee.trim()) {
        issues.push(
          createIssue('task-assignee', 'Task assignee is required.', { nodeId }),
        )
      }

      return issues
    }
    case 'approval': {
      const issues: ValidationIssue[] = []

      if (!data.title.trim()) {
        issues.push(
          createIssue('approval-title', 'Approval title is required.', {
            nodeId,
          }),
        )
      }

      if (!data.approverRole.trim()) {
        issues.push(
          createIssue('approval-role', 'Approver role is required.', { nodeId }),
        )
      }

      if (
        data.autoApproveThreshold !== null &&
        Number.isNaN(data.autoApproveThreshold)
      ) {
        issues.push(
          createIssue(
            'approval-threshold',
            'Auto-approve threshold must be a number.',
            { nodeId },
          ),
        )
      }

      return issues
    }
    case 'automated': {
      const issues: ValidationIssue[] = []

      if (!data.title.trim()) {
        issues.push(
          createIssue('automated-title', 'Automated step title is required.', {
            nodeId,
          }),
        )
      }

      if (!data.actionId.trim()) {
        issues.push(
          createIssue(
            'automated-action',
            'Choose an automation action before simulation.',
            { nodeId },
          ),
        )
      }

      for (const [key, value] of Object.entries(data.actionParams)) {
        if (!value.trim()) {
          issues.push(
            createIssue(
              'automated-params',
              `Automation parameter "${key}" is required.`,
              { nodeId },
            ),
          )
        }
      }

      return issues
    }
    case 'end':
      return data.endMessage.trim()
        ? []
        : [createIssue('end-message', 'End message is required.', { nodeId })]
  }
}

function findCycleNodes(
  nodes: GraphNode[],
  outgoing: Map<string, string[]>,
): Set<string> {
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const cycleNodes = new Set<string>()

  function visit(nodeId: string) {
    if (visiting.has(nodeId)) {
      cycleNodes.add(nodeId)
      return
    }

    if (visited.has(nodeId)) {
      return
    }

    visited.add(nodeId)
    visiting.add(nodeId)

    for (const nextId of outgoing.get(nodeId) ?? []) {
      if (visiting.has(nextId)) {
        cycleNodes.add(nodeId)
        cycleNodes.add(nextId)
        continue
      }

      visit(nextId)

      if (cycleNodes.has(nextId)) {
        cycleNodes.add(nodeId)
      }
    }

    visiting.delete(nodeId)
  }

  for (const node of nodes) {
    visit(node.id)
  }

  return cycleNodes
}

function findReachableNodes(
  startNodeId: string,
  outgoing: Map<string, string[]>,
): Set<string> {
  const reachable = new Set<string>()
  const queue = [startNodeId]

  while (queue.length > 0) {
    const currentNodeId = queue.shift()

    if (!currentNodeId || reachable.has(currentNodeId)) {
      continue
    }

    reachable.add(currentNodeId)

    for (const nextId of outgoing.get(currentNodeId) ?? []) {
      queue.push(nextId)
    }
  }

  return reachable
}

export function validateWorkflow(
  nodes: GraphNode[],
  edges: GraphEdge[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (nodes.length === 0) {
    return [
      createIssue(
        'empty-workflow',
        'Canvas is empty. Add a start node and at least one path to an end node.',
      ),
    ]
  }

  const { incoming, outgoing } = buildGraph(nodes, edges)
  const startNodes = nodes.filter((node) => node.type === 'start')
  const endNodes = nodes.filter((node) => node.type === 'end')

  if (startNodes.length !== 1) {
    issues.push(
      createIssue(
        'single-start',
        startNodes.length === 0
          ? 'Workflow requires exactly one start node.'
          : 'Workflow can only have one start node.',
      ),
    )
  }

  if (endNodes.length === 0) {
    issues.push(
      createIssue('end-required', 'Workflow requires at least one end node.'),
    )
  }

  for (const edge of edges) {
    if (edge.source === edge.target) {
      issues.push(
        createIssue('self-loop', 'Nodes cannot connect to themselves.', {
          edgeId: edge.id,
          nodeId: edge.source,
        }),
      )
    }
  }

  for (const node of nodes) {
    const data = toPersistentNodeData(node.data)
    const inboundCount = incoming.get(node.id)?.length ?? 0
    const outboundCount = outgoing.get(node.id)?.length ?? 0
    const label = getNodeLabel(data)

    issues.push(...validateNodeFields(node.id, data))

    if (node.type === 'start' && inboundCount > 0) {
      issues.push(
        createIssue(
          'start-first',
          `${label} must be the first node and cannot have incoming edges.`,
          { nodeId: node.id },
        ),
      )
    }

    if (node.type !== 'start' && inboundCount === 0) {
      issues.push(
        createIssue(
          'missing-inbound',
          `${label} is disconnected. Every non-start node needs an incoming edge.`,
          { nodeId: node.id },
        ),
      )
    }

    if (node.type === 'end' && outboundCount > 0) {
      issues.push(
        createIssue(
          'end-last',
          `${label} is an end node and cannot have outgoing edges.`,
          { nodeId: node.id },
        ),
      )
    }

    if (node.type !== 'end' && outboundCount === 0) {
      issues.push(
        createIssue(
          'missing-outbound',
          `${label} has no next step. Add an outgoing connection.`,
          { nodeId: node.id },
        ),
      )
    }
  }

  const cycleNodes = findCycleNodes(nodes, outgoing)
  for (const nodeId of cycleNodes) {
    issues.push(
      createIssue(
        'cycle',
        'Workflow contains a cycle. Remove loops before simulation.',
        { nodeId },
      ),
    )
  }

  if (startNodes.length === 1) {
    const reachable = findReachableNodes(startNodes[0].id, outgoing)
    for (const node of nodes) {
      if (!reachable.has(node.id)) {
        issues.push(
          createIssue(
            'unreachable',
            `${getNodeLabel(node.data)} cannot be reached from the start node.`,
            { nodeId: node.id },
          ),
        )
      }
    }
  }

  return issues
}

export function hasBlockingIssues(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error')
}
