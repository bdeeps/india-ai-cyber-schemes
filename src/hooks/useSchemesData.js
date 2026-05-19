import { useEffect, useState } from 'react'
import { fetchSchemesDirectory } from '../services/schemeService.js'

export function useSchemesData() {
  const [directory, setDirectory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchSchemesDirectory()
      .then((data) => {
        if (!cancelled) setDirectory(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load schemes')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { directory, isLoading, error }
}
