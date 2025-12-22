// User and Role Types
export type UserRole = 'surveyor' | 'conservation_officer' | 'budget_holder' | 'contractor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

// Site/Castle Types
export interface Site {
  id: string;
  name: string;
  location: string;
  description: string;
  created_at: string;
}

// Assessment Types
export type AssessmentStatus =
  | 'draft'
  | 'pending_surveyor'
  | 'pending_conservation'
  | 'pending_budget'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed';

export type ConditionRating = 1 | 2 | 3 | 4 | 5;

export interface AIAnalysis {
  door_type: string;
  estimated_age: string;
  condition_summary: string;
  conservation_concerns: string[];
  recommended_interventions: string[];
  heritage_considerations: string[];
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface Assessment {
  id: string;
  site_id: string;
  created_by: string;
  photo_url: string;
  photo_taken_at: string;
  door_type: string;
  door_location: string;
  ai_analysis: AIAnalysis | null;
  condition_rating: ConditionRating;
  status: AssessmentStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  site?: Site;
  creator?: User;
  conservation_plan?: ConservationPlan;
}

// Materials Types
export type HeritageGrade = 'standard' | 'conservation' | 'museum';

export interface MaterialCatalogItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  unit_price: number;
  supplier: string;
  supplier_contact: string;
  heritage_grade: HeritageGrade;
  description: string;
}

export interface MaterialRequirement {
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  supplier: string;
  heritage_grade: HeritageGrade;
}

// Conservation Plan Types
export type EffortLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ConservationPlan {
  id: string;
  assessment_id: string;
  work_description: string;
  materials: MaterialRequirement[];
  total_cost: number;
  effort_hours: number;
  effort_level: EffortLevel;
  conservation_notes: string;
  created_at: string;
}

// Approval Types
export type ApprovalType = 'surveyor' | 'conservation' | 'budget';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  assessment_id: string;
  approver_id: string;
  approval_type: ApprovalType;
  status: ApprovalStatus;
  comments: string | null;
  created_at: string;
  // Joined fields
  approver?: User;
}

// Work Assignment Types
export type WorkStatus = 'assigned' | 'in_progress' | 'completed';

export interface WorkAssignment {
  id: string;
  assessment_id: string;
  contractor_id: string;
  assigned_by: string;
  assigned_at: string;
  due_date: string | null;
  status: WorkStatus;
  completion_notes: string | null;
  completed_at: string | null;
  // Joined fields
  contractor?: User;
  assigner?: User;
  assessment?: Assessment;
}

// Email Types
export interface EmailNotification {
  to: string;
  subject: string;
  template: 'approval_request' | 'approval_decision' | 'work_assignment' | 'work_completion';
  data: Record<string, unknown>;
}

// Form Types
export interface NewAssessmentForm {
  site_id: string;
  door_location: string;
  photo: File | null;
  notes: string;
}

export interface ApprovalForm {
  status: 'approved' | 'rejected';
  comments: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Statistics Types
export interface DashboardStats {
  total_assessments: number;
  pending_approvals: number;
  active_projects: number;
  completed_this_month: number;
}
