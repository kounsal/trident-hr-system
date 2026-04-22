import { z } from 'zod'

import { workflowNodeTypes } from '../types/workflow.ts'

export const keyValuePairSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
})

export const startNodeDataSchema = z.object({
  kind: z.literal('start'),
  title: z.string(),
  metadata: z.array(keyValuePairSchema),
})

export const taskNodeDataSchema = z.object({
  kind: z.literal('task'),
  title: z.string(),
  description: z.string(),
  assignee: z.string(),
  dueDate: z.string(),
  customFields: z.array(keyValuePairSchema),
})

export const approvalNodeDataSchema = z.object({
  kind: z.literal('approval'),
  title: z.string(),
  approverRole: z.string(),
  autoApproveThreshold: z.number().nullable(),
})

export const automatedNodeDataSchema = z.object({
  kind: z.literal('automated'),
  title: z.string(),
  actionId: z.string(),
  actionLabel: z.string(),
  actionParams: z.record(z.string(), z.string()),
})

export const endNodeDataSchema = z.object({
  kind: z.literal('end'),
  endMessage: z.string(),
  summary: z.boolean(),
})

export const workflowNodeDataSchema = z.discriminatedUnion('kind', [
  startNodeDataSchema,
  taskNodeDataSchema,
  approvalNodeDataSchema,
  automatedNodeDataSchema,
  endNodeDataSchema,
])

export const workflowPayloadNodeSchema = z.object({
  id: z.string(),
  type: z.enum(workflowNodeTypes),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: workflowNodeDataSchema,
})

export const workflowPayloadEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
})

export const workflowPayloadSchema = z.object({
  nodes: z.array(workflowPayloadNodeSchema),
  edges: z.array(workflowPayloadEdgeSchema),
})

export const automationActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  params: z.array(z.string()),
  description: z.string(),
})

export const automationsResponseSchema = z.array(automationActionSchema)

export const simulationStepSchema = z.object({
  id: z.string(),
  nodeId: z.string(),
  nodeLabel: z.string(),
  status: z.enum(['success', 'warning', 'info']),
  message: z.string(),
})

export const simulationRequestSchema = z.object({
  workflow: workflowPayloadSchema,
})

export const simulationResponseSchema = z.object({
  status: z.literal('success'),
  startedAt: z.string(),
  finishedAt: z.string(),
  summary: z.string(),
  steps: z.array(simulationStepSchema),
})
