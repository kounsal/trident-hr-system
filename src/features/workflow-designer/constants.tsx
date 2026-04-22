import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  CirclePlay,
  ClipboardCheck,
  Flag,
  Zap,
} from 'lucide-react'

import type { WorkflowNodeType } from './types/workflow.ts'

export interface NodeDefinition {
  type: WorkflowNodeType
  label: string
  description: string
  accent: string
  icon: LucideIcon
}

export const nodeDefinitions: NodeDefinition[] = [
  {
    type: 'start',
    label: 'Start Node',
    description: 'Workflow entry point with optional metadata.',
    accent: 'teal',
    icon: Flag,
  },
  {
    type: 'task',
    label: 'Task Node',
    description: 'Human task for collecting data or documents.',
    accent: 'amber',
    icon: ClipboardCheck,
  },
  {
    type: 'approval',
    label: 'Approval Node',
    description: 'Role-based approval step with escalation threshold.',
    accent: 'coral',
    icon: BadgeCheck,
  },
  {
    type: 'automated',
    label: 'Automated Step',
    description: 'System action backed by mock automation catalog.',
    accent: 'blue',
    icon: Zap,
  },
  {
    type: 'end',
    label: 'End Node',
    description: 'Workflow completion with optional summary flag.',
    accent: 'sage',
    icon: CirclePlay,
  },
]

export const nodeDefinitionMap = Object.fromEntries(
  nodeDefinitions.map((definition) => [definition.type, definition]),
) as Record<WorkflowNodeType, NodeDefinition>
