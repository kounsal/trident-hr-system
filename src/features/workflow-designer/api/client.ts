import type {
  AutomationAction,
  SimulationResponse,
  WorkflowPayload,
} from '../types/workflow.ts'
import {
  automationsResponseSchema,
  simulationResponseSchema,
} from './contracts.ts'

async function parseJsonResponse(response: Response) {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function fetchAutomations(
  signal?: AbortSignal,
): Promise<AutomationAction[]> {
  const response = await fetch('/automations', { signal })
  const payload = await parseJsonResponse(response)
  return automationsResponseSchema.parse(payload)
}

export async function simulateWorkflowRequest(
  workflow: WorkflowPayload,
): Promise<SimulationResponse> {
  const response = await fetch('/simulate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workflow }),
  })
  const payload = await parseJsonResponse(response)
  return simulationResponseSchema.parse(payload)
}
