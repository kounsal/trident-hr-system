import { describe, expect, it } from 'vitest'

import type { WorkflowPayload } from '../types/workflow.ts'
import { validateWorkflow } from './validation.ts'

function buildValidWorkflow(): WorkflowPayload {
  return {
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 0, y: 0 },
        data: {
          kind: 'start',
          title: 'Employee onboarding',
          metadata: [],
        },
      },
      {
        id: 'task-1',
        type: 'task',
        position: { x: 220, y: 0 },
        data: {
          kind: 'task',
          title: 'Collect documents',
          description: '',
          assignee: 'HR Ops',
          dueDate: '2026-04-30',
          customFields: [],
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 460, y: 0 },
        data: {
          kind: 'end',
          endMessage: 'Done',
          summary: true,
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-1' },
      { id: 'e2', source: 'task-1', target: 'end-1' },
    ],
  }
}

describe('validateWorkflow', () => {
  it('accepts valid linear workflows', () => {
    const workflow = buildValidWorkflow()

    expect(validateWorkflow(workflow.nodes, workflow.edges)).toEqual([])
  })

  it('flags cycles and disconnected steps', () => {
    const workflow = buildValidWorkflow()
    workflow.edges.push({ id: 'e3', source: 'end-1', target: 'task-1' })

    const issues = validateWorkflow(workflow.nodes, workflow.edges)

    expect(issues.some((issue) => issue.rule === 'cycle')).toBe(true)
    expect(issues.some((issue) => issue.rule === 'end-last')).toBe(true)
  })
})
