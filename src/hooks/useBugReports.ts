import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dbService } from '../services/firebase/db'
import type { BugReportStatus } from '../types/bugReport'

const KEY = 'bugReports'

export function useBugReports(status?: BugReportStatus) {
  return useQuery({
    queryKey: [KEY, status ?? 'all'],
    queryFn: () => dbService.getBugReports(status),
  })
}

export function useNewBugReportCount(enabled = true) {
  return useQuery({
    queryKey: [KEY, 'newCount'],
    queryFn: () => dbService.getNewBugReportCount(),
    enabled,
    staleTime: 60_000,
  })
}

export function useUpdateBugReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: { status?: BugReportStatus; adminNotes?: string }
    }) => dbService.updateBugReport(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
