import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  MarkerType,
  type NodeChange,
} from '@xyflow/react'
import { useState } from 'react'

import type {
  DesignerEdge,
  DesignerNode,
  PersistentWorkflowNodeData,
  ValidationIssue,
  WorkflowNodeType,
} from '../types/workflow.ts'
import { createWorkflowNode, serializeWorkflow } from '../utils/workflow.ts'
import { validateWorkflow } from '../utils/validation.ts'

function decorateNodes(
  nodes: DesignerNode[],
  issues: ValidationIssue[],
): DesignerNode[] {
  const issueMap = new Map<string, string[]>()

  for (const issue of issues) {
    if (!issue.nodeId) {
      continue
    }

    const currentIssues = issueMap.get(issue.nodeId) ?? []
    currentIssues.push(issue.message)
    issueMap.set(issue.nodeId, currentIssues)
  }

  return nodes.map((node) => {
    const issueSummary = issueMap.get(node.id)

    return {
      ...node,
      data: {
        ...node.data,
        issueCount: issueSummary?.length,
        issueSummary,
      },
    }
  })
}

export function useWorkflowDesigner() {
  const [nodes, setNodes] = useState<DesignerNode[]>([])
  const [edges, setEdges] = useState<DesignerEdge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [issues, setIssues] = useState<ValidationIssue[]>([])

  function syncState(nextNodes: DesignerNode[], nextEdges: DesignerEdge[]) {
    const nextIssues = validateWorkflow(nextNodes, nextEdges)
    setNodes(decorateNodes(nextNodes, nextIssues))
    setEdges(nextEdges)
    setIssues(nextIssues)
  }

  function addNode(type: WorkflowNodeType, position: { x: number; y: number }) {
    const nextNodes = [...nodes, createWorkflowNode(type, position)]
    syncState(nextNodes, edges)
  }

  function onNodesChange(changes: NodeChange<DesignerNode>[]) {
    const nextNodes = applyNodeChanges<DesignerNode>(changes, nodes)
    const nextSelectedNodeId =
      selectedNodeId && nextNodes.some((node) => node.id === selectedNodeId)
        ? selectedNodeId
        : null

    setSelectedNodeId(nextSelectedNodeId)
    syncState(nextNodes, edges)
  }

  function onEdgesChange(changes: EdgeChange<DesignerEdge>[]) {
    syncState(nodes, applyEdgeChanges<DesignerEdge>(changes, edges))
  }

  function onConnect(connection: Connection) {
    const nextEdges = addEdge<DesignerEdge>(
      {
        ...connection,
        id: `edge-${crypto.randomUUID().slice(0, 8)}`,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#4f6884',
        },
      },
      edges,
    )

    syncState(nodes, nextEdges)
  }

  function updateNode(nodeId: string, data: PersistentWorkflowNodeData) {
    const nextNodes = nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            data,
          }
        : node,
    )

    syncState(nextNodes, edges)
  }

  function selectNode(nodeId: string | null) {
    setSelectedNodeId(nodeId)
  }

  const selectedNode =
    nodes.find((node) => node.id === selectedNodeId) ?? null

  return {
    nodes,
    edges,
    issues,
    selectedNode,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNode,
    selectNode,
    serialize: () => serializeWorkflow(nodes, edges),
  }
}
