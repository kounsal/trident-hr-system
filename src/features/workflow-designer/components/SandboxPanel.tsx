import type {
  SimulationResponse,
  ValidationIssue,
  WorkflowPayload,
} from '../types/workflow.ts'

interface SandboxPanelProps {
  payload: WorkflowPayload
  issues: ValidationIssue[]
  simulation: SimulationResponse | null
  isRunning: boolean
  error: string | null
  copyFeedback: string | null
  onRun: () => void
  onCopy: () => void
}

export function SandboxPanel({
  payload,
  issues,
  simulation,
  isRunning,
  error,
  copyFeedback,
  onRun,
  onCopy,
}: SandboxPanelProps) {
  const isReady = issues.length === 0

  return (
    <section className="panel sandbox-panel">
      <div className="panel__header">
        <p className="panel__eyebrow">Sandbox</p>
        <h2>Test workflow execution</h2>
        <p className="panel__copy">
          Serialize graph, validate structure, and replay execution through mock
          API.
        </p>
      </div>

      <div className="sandbox-statusbar">
        <span
          className={`status-pill ${
            isReady ? 'status-pill--success' : 'status-pill--warning'
          }`}
        >
          {isReady ? 'Ready to simulate' : `${issues.length} blocker${issues.length === 1 ? '' : 's'} active`}
        </span>
        <p className="sandbox-statusbar__copy">
          {isReady
            ? 'Graph passes structure checks and can be replayed step by step.'
            : 'Clear validation issues first so the mock engine can replay the flow.'}
        </p>
      </div>

      <div className="sandbox-actions">
        <button type="button" className="primary-button" onClick={onRun} disabled={isRunning}>
          {isRunning ? 'Running simulation...' : 'Run simulation'}
        </button>
        <button type="button" className="ghost-button" onClick={onCopy}>
          Copy JSON
        </button>
      </div>

      {copyFeedback ? (
        <div className="inline-alert inline-alert--success">{copyFeedback}</div>
      ) : null}

      {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

      <div className="sandbox-summary">
        <div className="metric-card">
          <span>Nodes</span>
          <strong>{payload.nodes.length}</strong>
        </div>
        <div className="metric-card">
          <span>Edges</span>
          <strong>{payload.edges.length}</strong>
        </div>
        <div className="metric-card">
          <span>Issues</span>
          <strong>{issues.length}</strong>
        </div>
      </div>

      {simulation ? (
        <div className="simulation-log">
          <div className="inline-alert inline-alert--success">
            {simulation.summary}
          </div>
          <ol className="simulation-list">
            {simulation.steps.map((step, index) => (
              <li key={step.id} className={`simulation-step simulation-step--${step.status}`}>
                <span className="simulation-step__index">
                  {`${index + 1}`.padStart(2, '0')}
                </span>
                <div className="simulation-step__content">
                  <strong>{step.nodeLabel}</strong>
                  <span>{step.message}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="empty-inline">
          Run simulation to view the execution log and timeline.
        </div>
      )}

      <details className="json-preview">
        <summary>
          <span>Serialized workflow JSON</span>
          <span className="json-preview__meta">{payload.nodes.length} node payload</span>
        </summary>
        <pre>{JSON.stringify(payload, null, 2)}</pre>
      </details>
    </section>
  )
}
