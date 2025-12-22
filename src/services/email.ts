import type { EmailNotification } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function sendEmail(notification: EmailNotification): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(notification),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Failed to send email');
  }
}

export async function sendApprovalRequestEmail(params: {
  approverEmail: string;
  approverName: string;
  approvalRole: string;
  siteName: string;
  doorLocation: string;
  submitterName: string;
  totalCost: string;
  conservationSummary: string;
  reviewUrl: string;
}): Promise<void> {
  await sendEmail({
    to: params.approverEmail,
    subject: `[Action Required] Door Assessment Review - ${params.siteName}`,
    template: 'approval_request',
    data: {
      approver_name: params.approverName,
      approval_role: params.approvalRole,
      site_name: params.siteName,
      door_location: params.doorLocation,
      submitter_name: params.submitterName,
      total_cost: params.totalCost,
      conservation_summary: params.conservationSummary,
      review_url: params.reviewUrl,
    },
  });
}

export async function sendApprovalDecisionEmail(params: {
  submitterEmail: string;
  submitterName: string;
  status: 'approved' | 'rejected';
  approverName: string;
  approvalRole: string;
  siteName: string;
  doorLocation: string;
  comments?: string;
  assessmentUrl: string;
}): Promise<void> {
  await sendEmail({
    to: params.submitterEmail,
    subject: `Assessment ${params.status === 'approved' ? 'Approved' : 'Rejected'} - ${params.siteName}`,
    template: 'approval_decision',
    data: {
      submitter_name: params.submitterName,
      status: params.status,
      approver_name: params.approverName,
      approval_role: params.approvalRole,
      site_name: params.siteName,
      door_location: params.doorLocation,
      comments: params.comments,
      assessment_url: params.assessmentUrl,
    },
  });
}

export async function sendWorkAssignmentEmail(params: {
  contractorEmail: string;
  contractorName: string;
  assignerName: string;
  siteName: string;
  doorLocation: string;
  workDescription: string;
  effortHours: number;
  totalCost: string;
  dueDate?: string;
  assignmentUrl: string;
}): Promise<void> {
  await sendEmail({
    to: params.contractorEmail,
    subject: `New Work Assignment - ${params.siteName}`,
    template: 'work_assignment',
    data: {
      contractor_name: params.contractorName,
      assigner_name: params.assignerName,
      site_name: params.siteName,
      door_location: params.doorLocation,
      work_description: params.workDescription,
      effort_hours: params.effortHours,
      total_cost: params.totalCost,
      due_date: params.dueDate,
      assignment_url: params.assignmentUrl,
    },
  });
}

export async function sendWorkCompletionEmail(params: {
  recipientEmail: string;
  recipientName: string;
  contractorName: string;
  siteName: string;
  doorLocation: string;
  completionDate: string;
  completionNotes?: string;
  assessmentUrl: string;
}): Promise<void> {
  await sendEmail({
    to: params.recipientEmail,
    subject: `Work Completion Confirmation - ${params.siteName}`,
    template: 'work_completion',
    data: {
      recipient_name: params.recipientName,
      contractor_name: params.contractorName,
      site_name: params.siteName,
      door_location: params.doorLocation,
      completion_date: params.completionDate,
      completion_notes: params.completionNotes,
      assessment_url: params.assessmentUrl,
    },
  });
}
