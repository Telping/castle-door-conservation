import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAssessments } from '@/hooks/useAssessments';
import { getStatusColor, getStatusLabel, formatDate, formatCurrency } from '@/lib/utils';
import type { AssessmentStatus } from '@/types';

const statusFilters: { value: AssessmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_surveyor', label: 'Pending Surveyor' },
  { value: 'pending_conservation', label: 'Pending Conservation' },
  { value: 'pending_budget', label: 'Pending Budget' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

export function Assessments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssessmentStatus | 'all'>('all');
  const { data: assessments, isLoading } = useAssessments();

  const filteredAssessments = assessments?.filter((assessment) => {
    const matchesSearch =
      search === '' ||
      assessment.site?.name?.toLowerCase().includes(search.toLowerCase()) ||
      assessment.door_location?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || assessment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Assessments</h1>
        <Link to="/new-assessment">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by site or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assessment List */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading assessments...</div>
      ) : filteredAssessments?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No assessments found.</p>
            <Link to="/new-assessment">
              <Button className="mt-4">Create First Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAssessments?.map((assessment) => (
            <Link key={assessment.id} to={`/assessments/${assessment.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    <img
                      src={assessment.photo_url}
                      alt="Door"
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-900">
                            {assessment.site?.name || 'Unknown Site'}
                          </h3>
                          <p className="truncate text-sm text-gray-600">
                            {assessment.door_location}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            assessment.status
                          )}`}
                        >
                          {getStatusLabel(assessment.status)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatDate(assessment.created_at)}</span>
                        {assessment.conservation_plan && (
                          <span className="font-medium text-gray-700">
                            {formatCurrency(assessment.conservation_plan.total_cost)}
                          </span>
                        )}
                        {assessment.ai_analysis && (
                          <span
                            className={`rounded px-1.5 py-0.5 ${
                              assessment.ai_analysis.urgency_level === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : assessment.ai_analysis.urgency_level === 'high'
                                ? 'bg-orange-100 text-orange-700'
                                : assessment.ai_analysis.urgency_level === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {assessment.ai_analysis.urgency_level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
