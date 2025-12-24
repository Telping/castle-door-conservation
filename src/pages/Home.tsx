import { Link } from 'react-router-dom';
import { Camera, ClipboardList, CheckSquare, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAssessments } from '@/hooks/useAssessments';
import { useAuth } from '@/hooks/useAuth';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

export function Home() {
  const { user } = useAuth();
  const { data: assessments, isLoading } = useAssessments();

  const stats = {
    total: assessments?.length || 0,
    pending: assessments?.filter((a) =>
      ['pending_surveyor', 'pending_conservation', 'pending_budget'].includes(a.status)
    ).length || 0,
    inProgress: assessments?.filter((a) => a.status === 'in_progress').length || 0,
    critical: assessments?.filter((a) => a.condition_rating <= 2).length || 0,
  };

  const recentAssessments = assessments?.slice(0, 5) || [];

  return (
    <div className="space-y-6 p-4">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-gray-600">Castle Door Conservation Management</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/new-assessment">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <Camera className="mb-2 h-8 w-8 text-green-700" />
              <span className="text-sm font-medium text-center">New Assessment</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/map">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <MapPin className="mb-2 h-8 w-8 text-orange-600" />
              <span className="text-sm font-medium text-center">Sites Map</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/approvals">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <CheckSquare className="mb-2 h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-center">Approvals</span>
              {stats.pending > 0 && (
                <span className="mt-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  {stats.pending}
                </span>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-xs text-gray-500">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Assessments</CardTitle>
          <Link to="/assessments">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : recentAssessments.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No assessments yet. Create your first one!
            </div>
          ) : (
            <div className="space-y-3">
              {recentAssessments.map((assessment) => (
                <Link
                  key={assessment.id}
                  to={`/assessments/${assessment.id}`}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
                >
                  <img
                    src={assessment.photo_url}
                    alt="Door"
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">
                      {assessment.site?.name || 'Unknown Site'}
                    </p>
                    <p className="truncate text-sm text-gray-500">
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
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
