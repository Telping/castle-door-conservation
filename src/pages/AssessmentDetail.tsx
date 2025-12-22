import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Wrench,
  FileText,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAssessment, useUpdateAssessment } from '@/hooks/useAssessments';
import { useAuth } from '@/hooks/useAuth';
import {
  formatDate,
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  getConditionLabel,
  getEffortLabel,
} from '@/lib/utils';

export function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: assessment, isLoading } = useAssessment(id!);
  const updateAssessment = useUpdateAssessment();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading assessment...</div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-4">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Assessment not found.
        </div>
      </div>
    );
  }

  const handleSubmitForApproval = async () => {
    await updateAssessment.mutateAsync({
      id: assessment.id,
      updates: { status: 'pending_surveyor' },
    });
  };

  const analysis = assessment.ai_analysis;
  const plan = assessment.conservation_plan;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            {assessment.site?.name || 'Assessment'}
          </h1>
          <p className="text-sm text-gray-600">{assessment.door_location}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
            assessment.status
          )}`}
        >
          {getStatusLabel(assessment.status)}
        </span>
      </div>

      {/* Photo */}
      <Card>
        <CardContent className="p-0">
          <img
            src={assessment.photo_url}
            alt="Door"
            className="w-full rounded-lg object-cover"
            style={{ maxHeight: '300px' }}
          />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {analysis && (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`h-5 w-5 ${
                    analysis.urgency_level === 'critical'
                      ? 'text-red-500'
                      : analysis.urgency_level === 'high'
                      ? 'text-orange-500'
                      : analysis.urgency_level === 'medium'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  }`}
                />
                <div>
                  <p className="text-sm text-gray-500">Urgency</p>
                  <p className="font-semibold capitalize">{analysis.urgency_level}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {plan && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Est. Cost</p>
                    <p className="font-semibold">{formatCurrency(plan.total_cost)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* AI Analysis */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Door Type</p>
              <p className="text-gray-900">{analysis.door_type}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Estimated Age</p>
              <p className="text-gray-900">{analysis.estimated_age}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Condition</p>
              <p className="text-gray-900">{analysis.condition_summary}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div
                      key={rating}
                      className={`h-2 w-6 first:rounded-l last:rounded-r ${
                        rating <= (assessment.condition_rating || 3)
                          ? rating <= 2
                            ? 'bg-red-500'
                            : rating <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {getConditionLabel(assessment.condition_rating || 3)}
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-500">Conservation Concerns</p>
              <div className="flex flex-wrap gap-2">
                {analysis.conservation_concerns.map((concern, i) => (
                  <Badge key={i} variant="warning">
                    {concern}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-500">
                Recommended Interventions
              </p>
              <ul className="space-y-1">
                {analysis.recommended_interventions.map((intervention, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <span>{intervention}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-500">Heritage Considerations</p>
              <ul className="space-y-1">
                {analysis.heritage_considerations.map((consideration, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>{consideration}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conservation Plan */}
      {plan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Conservation Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Work Description</p>
              <p className="text-gray-900">{plan.work_description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Effort Level</p>
                <p className="text-gray-900">{getEffortLabel(plan.effort_level)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Est. Hours</p>
                <p className="text-gray-900">{plan.effort_hours} hours</p>
              </div>
            </div>

            {plan.materials && plan.materials.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">Materials Required</p>
                <div className="space-y-2">
                  {plan.materials.map((material, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{material.material_name}</p>
                        <p className="text-xs text-gray-500">
                          {material.quantity} {material.unit} @ {formatCurrency(material.unit_price)}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(material.total_price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <span className="font-semibold">Total Cost</span>
              <span className="text-lg font-bold text-green-700">
                {formatCurrency(plan.total_cost)}
              </span>
            </div>

            {plan.conservation_notes && (
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-800">Conservation Notes</p>
                <p className="mt-1 text-sm text-amber-700">{plan.conservation_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {assessment.status === 'draft' && assessment.created_by === user?.id && (
        <div className="fixed bottom-20 left-0 right-0 border-t bg-white p-4">
          <Button
            className="w-full"
            onClick={handleSubmitForApproval}
            loading={updateAssessment.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit for Approval
          </Button>
        </div>
      )}

      {/* Meta */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Created: {formatDate(assessment.created_at)}</span>
            <span>By: {assessment.creator?.name || 'Unknown'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
