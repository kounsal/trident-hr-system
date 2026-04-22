import type { AutomationAction } from '../types/workflow.ts'

export const automationCatalog: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    params: ['to', 'subject'],
    description: 'Notify a candidate or stakeholder by email.',
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    params: ['template', 'recipient'],
    description: 'Create an offer letter, checklist, or HR form.',
  },
  {
    id: 'provision_access',
    label: 'Provision Access',
    params: ['system', 'accessLevel'],
    description: 'Provision application or workspace access.',
  },
  {
    id: 'create_ticket',
    label: 'Create Ticket',
    params: ['queue', 'priority'],
    description: 'Open an internal ticket for fulfillment teams.',
  },
]
