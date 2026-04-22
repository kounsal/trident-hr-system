import { Handle, Position, type NodeProps } from '@xyflow/react'
import clsx from 'clsx'

import { nodeDefinitionMap } from '../../constants.tsx'
import type { DesignerNode, WorkflowNodeData } from '../../types/workflow.ts'

function buildDetailLines(data: WorkflowNodeData) {
  switch (data.kind) {
    case 'start':
      return [
        `${data.metadata.length} metadata entr${data.metadata.length === 1 ? 'y' : 'ies'}`,
      ]
    case 'task':
      return [
        data.assignee ? `Owner: ${data.assignee}` : 'Owner not set',
        data.dueDate ? `Due: ${data.dueDate}` : 'No due date',
      ]
    case 'approval':
      return [
        data.approverRole ? `Role: ${data.approverRole}` : 'Approver role missing',
        data.autoApproveThreshold !== null
          ? `Threshold: ${data.autoApproveThreshold}`
          : 'Manual approval',
      ]
    case 'automated':
      return [
        data.actionLabel || 'No action selected',
        `${Object.keys(data.actionParams).length} parameter(s) configured`,
      ]
    case 'end':
      return [data.summary ? 'Summary enabled' : 'Summary disabled']
  }
}

export function WorkflowNodeCard({
  data,
  selected,
}: NodeProps<DesignerNode>) {
  const definition = nodeDefinitionMap[data.kind]
  const Icon = definition.icon
  const detailLines = buildDetailLines(data)

  return (
    <div
      className={clsx(
        'workflow-node',
        `workflow-node--${definition.accent}`,
        selected && 'workflow-node--selected',
        data.issueCount && 'workflow-node--invalid',
      )}
    >
      {data.kind !== 'start' ? (
        <Handle className="workflow-node__handle" type="target" position={Position.Left} />
      ) : null}

      <div className="workflow-node__header">
        <div className="workflow-node__icon">
          <Icon size={16} />
        </div>
        <div>
          <div className="workflow-node__eyebrow">{definition.label}</div>
          <div className="workflow-node__title">
            {data.kind === 'end' ? data.endMessage : data.title}
          </div>
        </div>
        {data.issueCount ? (
          <span className="workflow-node__badge">{data.issueCount}</span>
        ) : null}
      </div>

      <div className="workflow-node__body">
        {detailLines.map((line) => (
          <div key={line} className="workflow-node__detail">
            {line}
          </div>
        ))}
      </div>

      <div className="workflow-node__footer">
        <span className="workflow-node__code">{data.kind}</span>
        <span
          className={clsx(
            'workflow-node__state',
            data.issueCount
              ? 'workflow-node__state--alert'
              : 'workflow-node__state--ready',
          )}
        >
          {data.issueCount ? 'Needs attention' : 'Ready'}
        </span>
      </div>

      {data.kind !== 'end' ? (
        <Handle className="workflow-node__handle" type="source" position={Position.Right} />
      ) : null}
    </div>
  )
}
