import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dbService } from '@/services/firebase'
import type { ReportStatus } from '@/types'

const reportKeys = {
  all: ['reports'] as const,
  list: (status?: ReportStatus) => [...reportKeys.all, status || 'all'] as const,
}

export function useReports(status?: ReportStatus) {
  return useQuery({
    queryKey: reportKeys.list(status),
    queryFn: () => dbService.getReports(status ? { status } : undefined),
  })
}

export function useCreateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof dbService.createReport>[0]) => dbService.createReport(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: reportKeys.all }) },
  })
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reportId, status, reviewerId }: { reportId: string; status: ReportStatus; reviewerId: string }) =>
      dbService.updateReportStatus(reportId, status, reviewerId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: reportKeys.all }) },
  })
}
