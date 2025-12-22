import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApprovals,
  getPendingApprovals,
  createApproval,
  updateApproval,
  updateAssessment,
} from '@/services/supabase';
import {
  isDemoMode,
  getDemoApprovals,
  getPendingDemoApprovals,
  updateDemoApproval,
  updateDemoAssessment,
  getDemoAssessment,
} from '@/services/demoData';
import type { AssessmentStatus } from '@/types';

export function useApprovals(approverRole?: string) {
  return useQuery({
    queryKey: ['approvals', approverRole],
    queryFn: async () => {
      if (isDemoMode()) {
        let approvals = getDemoApprovals();
        if (approverRole) {
          approvals = approvals.filter(a => a.approval_type === approverRole);
        }
        // Attach assessment data
        return approvals.map(approval => ({
          ...approval,
          assessment: getDemoAssessment(approval.assessment_id),
        }));
      }

      const { data, error } = await getApprovals(approverRole);
      if (error) throw error;
      return data;
    },
  });
}

export function usePendingApprovals(userId: string, approvalType: string) {
  return useQuery({
    queryKey: ['pending-approvals', userId, approvalType],
    queryFn: async () => {
      if (isDemoMode()) {
        const approvals = getPendingDemoApprovals(userId, approvalType);
        // Attach assessment data
        return approvals.map(approval => ({
          ...approval,
          assessment: getDemoAssessment(approval.assessment_id),
        }));
      }

      const { data, error } = await getPendingApprovals(userId, approvalType);
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!approvalType,
  });
}

export function useSubmitForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assessmentId,
      approverId,
      approvalType,
    }: {
      assessmentId: string;
      approverId: string;
      approvalType: string;
    }) => {
      if (isDemoMode()) {
        const statusMap: Record<string, AssessmentStatus> = {
          surveyor: 'pending_surveyor',
          conservation: 'pending_conservation',
          budget: 'pending_budget',
        };

        updateDemoAssessment(assessmentId, {
          status: statusMap[approvalType] || 'pending_surveyor',
        });

        return { id: `approval-demo-${Date.now()}` };
      }

      // Create approval record
      const { data, error } = await createApproval({
        assessment_id: assessmentId,
        approver_id: approverId,
        approval_type: approvalType,
      });

      if (error) throw error;

      // Update assessment status
      const statusMap: Record<string, AssessmentStatus> = {
        surveyor: 'pending_surveyor',
        conservation: 'pending_conservation',
        budget: 'pending_budget',
      };

      await updateAssessment(assessmentId, {
        status: statusMap[approvalType] || 'pending_surveyor',
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
  });
}

export function useApprovalDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      approvalId,
      assessmentId,
      status,
      comments,
      nextStatus,
    }: {
      approvalId: string;
      assessmentId: string;
      status: 'approved' | 'rejected';
      comments?: string;
      nextStatus: AssessmentStatus;
    }) => {
      if (isDemoMode()) {
        updateDemoApproval(approvalId, status, comments);
        updateDemoAssessment(assessmentId, { status: nextStatus });
        return { id: approvalId, status };
      }

      // Update approval
      const { data, error } = await updateApproval(approvalId, status, comments);
      if (error) throw error;

      // Update assessment status
      await updateAssessment(assessmentId, { status: nextStatus });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
  });
}

export function getNextApprovalStatus(
  currentStatus: AssessmentStatus,
  decision: 'approved' | 'rejected'
): AssessmentStatus {
  if (decision === 'rejected') {
    return 'rejected';
  }

  switch (currentStatus) {
    case 'pending_surveyor':
      return 'pending_conservation';
    case 'pending_conservation':
      return 'pending_budget';
    case 'pending_budget':
      return 'approved';
    default:
      return currentStatus;
  }
}

export function getApprovalTypeForRole(role: string): string | null {
  switch (role) {
    case 'surveyor':
      return 'surveyor';
    case 'conservation_officer':
      return 'conservation';
    case 'budget_holder':
      return 'budget';
    default:
      return null;
  }
}
