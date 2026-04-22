import { describe, expect, it } from 'vitest'

import type { WorkflowPayload } from '../types/workflow.ts'
import { runWorkflowSimulation } from './simulation.ts'

describe('runWorkflowSimulation', () => {
  it('returns ordered execution steps for a small workflow', () => {
    const workflow: WorkflowPayload = {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 0, y: 0 },
          data: {
            kind: 'start',
            title: 'New hire onboarding',
            metadata: [],
          },
        },
        {
          id: 'automated-1',
          type: 'automated',
          position: { x: 240, y: 0 },
          data: {
            kind: 'automated',
            title: 'Welcome email',
            actionId: 'send_email',
            actionLabel: 'Send Email',
            actionParams: {
              to: 'alex@example.com',
              subject: 'Welcome aboard',
            },
          },
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 480, y: 0 },
          data: {
            kind: 'end',
            endMessage: 'Completed',
            summary: true,
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'start-1', target: 'automated-1' },
        { id: 'e2', source: 'automated-1', target: 'end-1' },
      ],
    }

    const simulation = runWorkflowSimulation(workflow)

    expect(simulation.steps).toHaveLength(3)
    expect(simulation.steps[1].message).toContain('Send Email executed')
    expect(simulation.summary).toContain('3 step(s) executed')
  })
})
