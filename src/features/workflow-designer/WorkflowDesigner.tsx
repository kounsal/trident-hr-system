import '@xyflow/react/dist/style.css'
import { useState } from 'react'

import { simulateWorkflowRequest } from './api/client.ts'
import { NodeFormPanel } from './components/NodeFormPanel.tsx'
import { SandboxPanel } from './components/SandboxPanel.tsx'
import { SidebarPalette } from './components/SidebarPalette.tsx'
import { WorkflowCanvas } from './components/WorkflowCanvas.tsx'
import { useAutomations } from './hooks/useAutomations.ts'
import { useWorkflowDesigner } from './hooks/useWorkflowDesigner.ts'
import { hasBlockingIssues } from './utils/validation.ts'
import './workflow-designer.css'

export function WorkflowDesigner() {
  const automations = useAutomations()
  const designer = useWorkflowDesigner()
  const payload = designer.serialize()
  const issueCount = designer.issues.length
  const [simulationError, setSimulationError] = useState<string | null>(null)
  const [simulationResult, setSimulationResult] = useState<Awaited<
    ReturnType<typeof simulateWorkflowRequest>
  > | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  async function handleRunSimulation() {
    if (hasBlockingIssues(designer.issues)) {
      setSimulationResult(null)
      setSimulationError('Resolve workflow errors before running simulation.')
      return
    }

    try {
      setIsSimulating(true)
      setSimulationError(null)
      const result = await simulateWorkflowRequest(payload)
      setSimulationResult(result)
    } catch (error) {
      setSimulationError(
        error instanceof Error ? error.message : 'Simulation request failed.',
      )
    } finally {
      setIsSimulating(false)
    }
  }

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      setCopyFeedback('Workflow JSON copied to clipboard.')
    } catch {
      setCopyFeedback('Clipboard unavailable in this browser context.')
    }
  }

  function handleQuickAdd(type: Parameters<typeof designer.addNode>[0]) {
    designer.addNode(type, {
      x: 140 + (payload.nodes.length % 3) * 36,
      y: 120 + payload.nodes.length * 40,
    })
  }

  return (
    <div className="workflow-shell">
      <div className="workflow-command-strip" aria-label="Workflow designer capabilities">
        <span className="workflow-command-strip__label">Control Deck</span>
        <span className="command-chip">Drag or quick-add steps</span>
        <span className="command-chip">Edit forms swap by node type</span>
        <span className="command-chip">Simulation runs against live mock endpoints</span>
      </div>

      <header className="workflow-header">
        <div className="workflow-header__layout">
          <div className="workflow-header__main">
            <p className="workflow-header__eyebrow">Tredence Case Study Prototype</p>
            <h1>HR Workflow Designer</h1>
            <p className="workflow-header__copy">
              An editorial control-room for drafting onboarding, leave approval,
              and verification flows. Build on a dark stage, tune each step in
              the inspector, then pressure-test the graph in sandbox.
            </p>

            <div className="workflow-header__legend">
              <article className="legend-card">
                <span className="legend-card__index">01</span>
                <strong>Compose</strong>
                <p>Seed the graph with drag-drop cards or quick-add from the build kit.</p>
              </article>
              <article className="legend-card">
                <span className="legend-card__index">02</span>
                <strong>Configure</strong>
                <p>Each node opens its own typed form contract in the right rail.</p>
              </article>
              <article className="legend-card">
                <span className="legend-card__index">03</span>
                <strong>Validate</strong>
                <p>Graph rules run on every edit before simulation or JSON export.</p>
              </article>
            </div>
          </div>

          <aside className="workflow-stats-shell">
            <div className="workflow-stats-head">
              <span
                className={`status-pill ${
                  issueCount === 0 ? 'status-pill--success' : 'status-pill--warning'
                }`}
              >
                {issueCount === 0 ? 'Graph stable' : `${issueCount} issue${issueCount === 1 ? '' : 's'} open`}
              </span>
              <p className="workflow-stats-note">
                Validation runs every move. MSW keeps API behavior realistic
                without needing backend persistence.
              </p>
            </div>

            <div className="workflow-stats">
              <div className="metric-card">
                <span>Nodes</span>
                <strong>{payload.nodes.length}</strong>
              </div>
              <div className="metric-card">
                <span>Links</span>
                <strong>{payload.edges.length}</strong>
              </div>
              <div className="metric-card">
                <span>Actions</span>
                <strong>{automations.actions.length}</strong>
              </div>
              <div className="metric-card">
                <span>Issues</span>
                <strong>{issueCount}</strong>
              </div>
            </div>

            <p className="workflow-stats-footnote">
              Keyboard hint: backspace/delete removes selected nodes and edges.
            </p>
          </aside>
        </div>
      </header>

      <div className="workflow-grid">
        <SidebarPalette
          issues={designer.issues}
          automationCount={automations.actions.length}
          automationError={automations.error}
          onQuickAdd={handleQuickAdd}
        />

        <WorkflowCanvas
          nodes={designer.nodes}
          edges={designer.edges}
          onNodesChange={designer.onNodesChange}
          onEdgesChange={designer.onEdgesChange}
          onConnect={designer.onConnect}
          onAddNode={designer.addNode}
          onSelectNode={designer.selectNode}
        />

        <div className="workflow-right-rail">
          <NodeFormPanel
            selectedNode={designer.selectedNode}
            automations={automations.actions}
            isAutomationLoading={automations.isLoading}
            onUpdateNode={designer.updateNode}
          />

          <SandboxPanel
            payload={payload}
            issues={designer.issues}
            simulation={simulationResult}
            isRunning={isSimulating}
            error={simulationError}
            copyFeedback={copyFeedback}
            onRun={handleRunSimulation}
            onCopy={handleCopyJson}
          />
        </div>
      </div>
    </div>
  )
}
