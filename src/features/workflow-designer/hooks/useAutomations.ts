import { useEffect, useState } from 'react'

import { fetchAutomations } from '../api/client.ts'
import type { AutomationAction } from '../types/workflow.ts'

export function useAutomations() {
  const [actions, setActions] = useState<AutomationAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    async function loadAutomations() {
      try {
        setIsLoading(true)
        const nextActions = await fetchAutomations(controller.signal)

        if (!isMounted) {
          return
        }

        setActions(nextActions)
        setError(null)
      } catch (loadError) {
        if (!isMounted || controller.signal.aborted) {
          return
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load automation actions.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadAutomations()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  return {
    actions,
    isLoading,
    error,
  }
}
