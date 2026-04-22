import type { DragEvent } from 'react'

import { nodeDefinitions } from '../constants.tsx'
import type { ValidationIssue, WorkflowNodeType } from '../types/workflow.ts'
import { dragMimeType } from '../utils/dnd.ts'

interface SidebarPaletteProps {
  issues: ValidationIssue[]
  automationCount: number
  automationError: string | null
  onQuickAdd: (type: WorkflowNodeType) => void
}

export function SidebarPalette({
  issues,
  automationCount,
  automationError,
  onQuickAdd,
}: SidebarPaletteProps) {
  function handleDragStart(event: DragEvent<HTMLButtonElement>, type: WorkflowNodeType) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData(dragMimeType, type)
  }

  return (
    <aside className="workflow-sidebar panel">
      <div className="panel__header">
        <p className="panel__eyebrow">Node Palette</p>
        <h2>Compose workflow blocks</h2>
        <p className="panel__copy">
          Drag blocks onto the canvas or tap quick add to seed the first draft.
        </p>
      </div>

      <div className="sidebar-callout">
        <span className="sidebar-callout__label">Flow Recipe</span>
        <strong>Start the process, route human or automated work, then close on an end node.</strong>
        <p>Every block carries its own form contract and validation logic.</p>
      </div>

      <div className="palette-list">
        {nodeDefinitions.map((definition) => {
          const Icon = definition.icon

          return (
            <div key={definition.type} className="palette-card">
              <button
                type="button"
                className={`palette-card__drag palette-card__drag--${definition.accent}`}
                draggable
                onDragStart={(event) => handleDragStart(event, definition.type)}
              >
                <span className="palette-card__icon">
                  <Icon size={16} />
                </span>
                <span className="palette-card__content">
                  <strong>{definition.label}</strong>
                  <small>{definition.description}</small>
                </span>
              </button>

              <div className="palette-card__footer">
                <span className="palette-card__verb">drag to stage</span>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => onQuickAdd(definition.type)}
                >
                  Quick add
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section__header">
          <h3>Mock API</h3>
          <span className="pill">{automationCount} actions</span>
        </div>
        <p className="sidebar-section__copy">
          `GET /automations` powers automated step forms. `POST /simulate`
          validates and replays workflow state.
        </p>
        {automationError ? (
          <p className="inline-alert inline-alert--error">{automationError}</p>
        ) : null}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section__header">
          <h3>Validation</h3>
          <span className="pill">{issues.length}</span>
        </div>
        {issues.length === 0 ? (
          <p className="inline-alert inline-alert--success">
            Graph valid. Ready for sandbox execution.
          </p>
        ) : (
          <ul className="issue-list">
            {issues.slice(0, 5).map((issue) => (
              <li key={issue.id}>{issue.message}</li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
