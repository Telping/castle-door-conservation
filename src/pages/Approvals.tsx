import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import {
  usePendingApprovals,
  useApprovalDecision,
  getApprovalTypeForRole,
  getNextApprovalStatus,
} from '@/hooks/useApprovals';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Approval, AssessmentStatus } from '@/types';

export function Approvals() {
  const { user } = useAuth();
  const approvalType = user ? getApprovalTypeForRole(user.role) : null;

  const { data: approvals, isLoading } = usePendingApprovals(
    user?.id || '',
    approvalType || ''
  );

  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [comments, setComments] = useState('');
  const approvalDecision = useApprovalDecision();

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!selectedApproval) return;

    const assessment = (selectedApproval as any).assessment;
    const nextStatus = getNextApprovalStatus(
      assessment.status as AssessmentStatus,
      decision
    );

    await approvalDecision.mutateAsync({
      approvalId: selectedApproval.id,
      assessmentId: selectedApproval.assessment_id,
      status: decision,
      comments: comments || undefined,
      nextStatus,
    });

    setSelectedApproval(null);
    setComments('');
  };

  if (!approvalType) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-xl font-bold text-gray-900">Approvals</h1>
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Your role ({user?.role}) does not have approval responsibilities.
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleName = (type: string) => {
    switch (type) {
      case 'surveyor':
        return 'Site Surveyor';
      case 'conservation':
        return 'Conservation Officer';
      case 'budget':
        return 'Budget Holder';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-600">
            Review as {getRoleName(approvalType)}
          </p>
        </div>
        <Badge variant="info">{approvals?.length || 0} pending</Badge>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading approvals...</div>
      ) : approvals?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle className="mb-3 h-12 w-12 text-green-500" />
            <p className="text-lg font-medium text-gray-900">All caught up!</p>
            <p className="text-gray-500">No pending approvals at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals?.map((approval) => {
            const assessment = (approval as any).assessment;
            const plan = assessment?.conservation_plan;

            return (
              <Card key={approval.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={assessment?.photo_url}
                      alt="Door"
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {assessment?.site?.name || 'Unknown Site'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {assessment?.door_location}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDate(approval.created_at)}
                        </span>
                        {plan && (
                          <span className="font-medium text-gray-700">
                            {formatCurrency(plan.total_cost)}
                          </span>
                        )}
                        {assessment?.ai_analysis && (
                          <Badge
                            variant={
                              assessment.ai_analysis.urgency_level === 'critical'
                                ? 'error'
                                : assessment.ai_analysis.urgency_level === 'high'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {assessment.ai_analysis.urgency_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {assessment?.ai_analysis && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                      <p className="text-gray-700">
                        {assessment.ai_analysis.condition_summary}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link to={`/assessments/${assessment?.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedApproval(approval)}
                    >
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Approval Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Review Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">
                  {(selectedApproval as any).assessment?.site?.name} -{' '}
                  {(selectedApproval as any).assessment?.door_location}
                </p>
              </div>

              <Textarea
                label="Comments (optional)"
                placeholder="Add any notes or feedback..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedApproval(null);
                    setComments('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDecision('rejected')}
                  loading={approvalDecision.isPending}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleDecision('approved')}
                  loading={approvalDecision.isPending}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
