import type { ChangeEvent, ReactNode } from 'react'

import { nodeDefinitionMap } from '../constants.tsx'
import type {
  AutomationAction,
  DesignerNode,
  KeyValuePair,
  PersistentWorkflowNodeData,
} from '../types/workflow.ts'
import { createKeyValuePair, toPersistentNodeData } from '../utils/workflow.ts'

interface NodeFormPanelProps {
  selectedNode: DesignerNode | null
  automations: AutomationAction[]
  isAutomationLoading: boolean
  onUpdateNode: (nodeId: string, data: PersistentWorkflowNodeData) => void
}

interface FieldProps {
  label: string
  hint?: string
  children: ReactNode
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      {hint ? <span className="form-field__hint">{hint}</span> : null}
      {children}
    </label>
  )
}

interface KeyValueEditorProps {
  label: string
  hint: string
  pairs: KeyValuePair[]
  onChange: (pairs: KeyValuePair[]) => void
}

function KeyValueEditor({
  label,
  hint,
  pairs,
  onChange,
}: KeyValueEditorProps) {
  function updatePair(pairId: string, key: keyof KeyValuePair, value: string) {
    onChange(
      pairs.map((pair) =>
        pair.id === pairId
          ? {
              ...pair,
              [key]: value,
            }
          : pair,
      ),
    )
  }

  function removePair(pairId: string) {
    onChange(pairs.filter((pair) => pair.id !== pairId))
  }

  return (
    <div className="form-field">
      <span className="form-field__label">{label}</span>
      <span className="form-field__hint">{hint}</span>
      <div className="key-value-list">
        {pairs.length === 0 ? (
          <div className="empty-inline">No key-value pairs added yet.</div>
        ) : (
          pairs.map((pair) => (
            <div key={pair.id} className="key-value-row">
              <input
                value={pair.key}
                onChange={(event) => updatePair(pair.id, 'key', event.target.value)}
                placeholder="Key"
              />
              <input
                value={pair.value}
                onChange={(event) =>
                  updatePair(pair.id, 'value', event.target.value)
                }
                placeholder="Value"
              />
              <button
                type="button"
                className="ghost-button ghost-button--danger"
                onClick={() => removePair(pair.id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
      <button
        type="button"
        className="ghost-button"
        onClick={() => onChange([...pairs, createKeyValuePair()])}
      >
        Add field
      </button>
    </div>
  )
}

export function NodeFormPanel({
  selectedNode,
  automations,
  isAutomationLoading,
  onUpdateNode,
}: NodeFormPanelProps) {
  if (!selectedNode) {
    return (
      <section className="panel inspector-panel inspector-panel--empty">
        <div className="panel__header">
          <p className="panel__eyebrow">Inspector</p>
          <h2>Select a node</h2>
          <p className="panel__copy">
            Click any node on canvas to edit its configuration here.
          </p>
        </div>

        <div className="inspector-placeholder">
          <span className="pill">Awaiting selection</span>
          <p>
            This rail swaps forms automatically for start, task, approval,
            automated, and end steps.
          </p>
        </div>
      </section>
    )
  }

  const data = toPersistentNodeData(selectedNode.data)
  const selectedNodeId = selectedNode.id
  const definition = nodeDefinitionMap[data.kind]
  const Icon = definition.icon

  function commit(nextData: PersistentWorkflowNodeData) {
    onUpdateNode(selectedNodeId, nextData)
  }

  function renderStartForm() {
    if (data.kind !== 'start') {
      return null
    }

    return (
      <>
        <Field label="Start title">
          <input
            value={data.title}
            onChange={(event) =>
              commit({
                ...data,
                title: event.target.value,
              })
            }
            placeholder="New hire onboarding"
          />
        </Field>

        <KeyValueEditor
          label="Metadata"
          hint="Optional context fields available at workflow start."
          pairs={data.metadata}
          onChange={(metadata) =>
            commit({
              ...data,
              metadata,
            })
          }
        />
      </>
    )
  }

  function renderTaskForm() {
    if (data.kind !== 'task') {
      return null
    }

    return (
      <>
        <Field label="Title">
          <input
            value={data.title}
            onChange={(event) =>
              commit({
                ...data,
                title: event.target.value,
              })
            }
            placeholder="Collect employee documents"
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={4}
            value={data.description}
            onChange={(event) =>
              commit({
                ...data,
                description: event.target.value,
              })
            }
            placeholder="Ask the employee to upload PAN, Aadhaar, and signed NDA."
          />
        </Field>

        <div className="form-grid">
          <Field label="Assignee">
            <input
              value={data.assignee}
              onChange={(event) =>
                commit({
                  ...data,
                  assignee: event.target.value,
                })
              }
              placeholder="HR Ops"
            />
          </Field>

          <Field label="Due date">
            <input
              type="date"
              value={data.dueDate}
              onChange={(event) =>
                commit({
                  ...data,
                  dueDate: event.target.value,
                })
              }
            />
          </Field>
        </div>

        <KeyValueEditor
          label="Custom fields"
          hint="Optional fields shown to task owners."
          pairs={data.customFields}
          onChange={(customFields) =>
            commit({
              ...data,
              customFields,
            })
          }
        />
      </>
    )
  }

  function renderApprovalForm() {
    if (data.kind !== 'approval') {
      return null
    }

    return (
      <>
        <Field label="Title">
          <input
            value={data.title}
            onChange={(event) =>
              commit({
                ...data,
                title: event.target.value,
              })
            }
            placeholder="Manager approval"
          />
        </Field>

        <div className="form-grid">
          <Field label="Approver role">
            <input
              value={data.approverRole}
              onChange={(event) =>
                commit({
                  ...data,
                  approverRole: event.target.value,
                })
              }
              placeholder="HRBP"
            />
          </Field>

          <Field label="Auto-approve threshold" hint="Optional numeric guardrail.">
            <input
              type="number"
              min="0"
              value={data.autoApproveThreshold ?? ''}
              onChange={(event) =>
                commit({
                  ...data,
                  autoApproveThreshold:
                    event.target.value === ''
                      ? null
                      : Number.parseInt(event.target.value, 10),
                })
              }
              placeholder="5"
            />
          </Field>
        </div>
      </>
    )
  }

  function renderAutomatedForm() {
    if (data.kind !== 'automated') {
      return null
    }

    const automatedData = data
    const selectedAction =
      automations.find((action) => action.id === automatedData.actionId) ?? null

    function handleActionChange(event: ChangeEvent<HTMLSelectElement>) {
      const action =
        automations.find((option) => option.id === event.target.value) ?? null
      const nextParams = Object.fromEntries(
        (action?.params ?? []).map((param) => [
          param,
          automatedData.actionParams[param] ?? '',
        ]),
      )

      commit({
        ...automatedData,
        actionId: action?.id ?? '',
        actionLabel: action?.label ?? '',
        actionParams: nextParams,
      })
    }

    return (
      <>
        <Field label="Title">
          <input
            value={automatedData.title}
            onChange={(event) =>
              commit({
                ...automatedData,
                title: event.target.value,
              })
            }
            placeholder="Send welcome email"
          />
        </Field>

        <Field label="Mock action" hint="Loaded from GET /automations.">
          <select
            value={automatedData.actionId}
            onChange={handleActionChange}
            disabled={isAutomationLoading}
          >
            <option value="">Select action</option>
            {automations.map((action) => (
              <option key={action.id} value={action.id}>
                {action.label}
              </option>
            ))}
          </select>
        </Field>

        {selectedAction ? (
          <div className="automation-params">
            <div className="inline-alert inline-alert--info">
              {selectedAction.description}
            </div>
            {selectedAction.params.map((param) => (
              <Field key={param} label={param}>
                <input
                  value={data.actionParams[param] ?? ''}
                  onChange={(event) =>
                    commit({
                      ...automatedData,
                      actionParams: {
                        ...automatedData.actionParams,
                        [param]: event.target.value,
                      },
                    })
                  }
                  placeholder={`Set ${param}`}
                />
              </Field>
            ))}
          </div>
        ) : (
          <div className="empty-inline">
            Choose an action to reveal dynamic parameters.
          </div>
        )}
      </>
    )
  }

  function renderEndForm() {
    if (data.kind !== 'end') {
      return null
    }

    return (
      <>
        <Field label="End message">
          <textarea
            rows={3}
            value={data.endMessage}
            onChange={(event) =>
              commit({
                ...data,
                endMessage: event.target.value,
              })
            }
            placeholder="Onboarding completed successfully."
          />
        </Field>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={data.summary}
            onChange={(event) =>
              commit({
                ...data,
                summary: event.target.checked,
              })
            }
          />
          <span>Include summary flag in completion step</span>
        </label>
      </>
    )
  }

  return (
    <section className="panel inspector-panel">
      <div className="panel__header">
        <p className="panel__eyebrow">Inspector</p>
        <div className="inspector-title">
          <span className={`inspector-icon inspector-icon--${definition.accent}`}>
            <Icon size={16} />
          </span>
          <div>
            <h2>{definition.label}</h2>
            <p className="panel__copy">{definition.description}</p>
          </div>
        </div>
        <div className="inspector-meta">
          <span className={`pill pill--${definition.accent}`}>{definition.label}</span>
          <span className="inspector-id">{selectedNodeId}</span>
        </div>
      </div>

      <div className="panel__body inspector-form">
        {selectedNode.data.issueSummary?.length ? (
          <div className="inline-alert inline-alert--error">
            {selectedNode.data.issueSummary[0]}
          </div>
        ) : null}
        {renderStartForm()}
        {renderTaskForm()}
        {renderApprovalForm()}
        {renderAutomatedForm()}
        {renderEndForm()}
      </div>
    </section>
  )
}
