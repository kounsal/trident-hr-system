import { delay, http, HttpResponse } from 'msw'

import { simulationRequestSchema } from '../api/contracts.ts'
import { runWorkflowSimulation } from '../utils/simulation.ts'
import { hasBlockingIssues, validateWorkflow } from '../utils/validation.ts'
import { automationCatalog } from './data.ts'

export const handlers = [
  http.get('/automations', async () => {
    await delay(250)
    return HttpResponse.json(automationCatalog)
  }),

  http.post('/simulate', async ({ request }) => {
    await delay(450)

    const body = await request.json()
    const parsed = simulationRequestSchema.safeParse(body)

    if (!parsed.success) {
      return HttpResponse.json(
        {
          message: 'Invalid workflow payload.',
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    const issues = validateWorkflow(
      parsed.data.workflow.nodes,
      parsed.data.workflow.edges,
    )

    if (hasBlockingIssues(issues)) {
      return HttpResponse.json(
        {
          message: 'Workflow validation failed.',
          issues,
        },
        { status: 422 },
      )
    }

    return HttpResponse.json(runWorkflowSimulation(parsed.data.workflow))
  }),
]
