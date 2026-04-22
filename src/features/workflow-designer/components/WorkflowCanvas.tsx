import type { DragEvent } from 'react'
import {
  Background,
  Controls,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  useReactFlow,
} from '@xyflow/react'

import type {
  DesignerEdge,
  DesignerNode,
  WorkflowNodeType,
} from '../types/workflow.ts'
import { dragMimeType } from '../utils/dnd.ts'
import { WorkflowNodeCard } from './nodes/WorkflowNodeCard.tsx'

interface WorkflowCanvasProps {
  nodes: DesignerNode[]
  edges: DesignerEdge[]
  onNodesChange: OnNodesChange<DesignerNode>
  onEdgesChange: OnEdgesChange<DesignerEdge>
  onConnect: OnConnect
  onAddNode: (type: WorkflowNodeType, position: { x: number; y: number }) => void
  onSelectNode: (nodeId: string | null) => void
}

const nodeTypes = {
  start: WorkflowNodeCard,
  task: WorkflowNodeCard,
  approval: WorkflowNodeCard,
  automated: WorkflowNodeCard,
  end: WorkflowNodeCard,
}

function CanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
  onSelectNode,
}: WorkflowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow()

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()

    const type = event.dataTransfer.getData(dragMimeType) as WorkflowNodeType

    if (!type) {
      return
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    onAddNode(type, position)
  }

  return (
    <div className="workflow-canvas panel">
      <div className="canvas-hud canvas-hud--top">
        <span className="canvas-hud__label">Builder Stage</span>
        <span className="canvas-hud__meta">
          Drag to place. Connect left to right. Delete with backspace.
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => onSelectNode(null)}
        onSelectionChange={({ nodes: selectedNodes }) =>
          onSelectNode(selectedNodes[0]?.id ?? null)
        }
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        selectionMode={SelectionMode.Partial}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: {
            stroke: '#4f6884',
            strokeWidth: 1.5,
          },
        }}
        className="workflow-flow"
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => {
            switch (node.type) {
              case 'start':
                return '#16a085'
              case 'task':
                return '#d08b28'
              case 'approval':
                return '#e06b56'
              case 'automated':
                return '#4d7cff'
              case 'end':
                return '#5b8c5a'
              default:
                return '#64748b'
            }
          }}
          maskColor="rgba(17, 35, 52, 0.72)"
        />
        <Controls showInteractive={false} />
        <Background gap={20} color="rgba(132, 153, 178, 0.22)" />
      </ReactFlow>

      <div className="canvas-hud canvas-hud--bottom">
        <span className="canvas-hud__meta">
          React Flow canvas with live validation, minimap, and smooth edges.
        </span>
      </div>

      {nodes.length === 0 ? (
        <div className="canvas-empty-state">
          <span className="pill">Dark drafting stage</span>
          <h3>Drop a node to begin the workflow draft</h3>
          <p>
            Build onboarding, leave approval, or document verification flows by
            composing steps left to right.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}
