import { createClient } from '@supabase/supabase-js';
import type {
  User,
  Site,
  Assessment,
  ConservationPlan,
  Approval,
  WorkAssignment,
  MaterialCatalogItem,
} from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Auth Functions
export async function signUp(email: string, password: string, name: string, role: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Try to get profile from profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile exists, return it
  if (profile && !error) {
    return profile as User;
  }

  // Fallback: create user object from auth metadata
  // This handles the case where profiles table doesn't exist yet
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    role: user.user_metadata?.role || 'surveyor',
    created_at: user.created_at,
  } as User;
}

// Sites Functions
export async function getSites() {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('name');
  return { data: data as Site[] | null, error };
}

export async function createSite(site: Omit<Site, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('sites')
    .insert(site)
    .select()
    .single();
  return { data: data as Site | null, error };
}

// Materials Functions
export async function getMaterials() {
  const { data, error } = await supabase
    .from('materials_catalog')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  return { data: data as MaterialCatalogItem[] | null, error };
}

// Assessments Functions
export async function getAssessments(status?: string) {
  let query = supabase
    .from('assessments')
    .select(`
      *,
      site:sites(*),
      creator:profiles!assessments_created_by_fkey(*),
      conservation_plan:conservation_plans(*)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data: data as Assessment[] | null, error };
}

export async function getAssessment(id: string) {
  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      site:sites(*),
      creator:profiles!assessments_created_by_fkey(*),
      conservation_plan:conservation_plans(*)
    `)
    .eq('id', id)
    .single();
  return { data: data as Assessment | null, error };
}

export async function createAssessment(assessment: {
  site_id: string;
  created_by: string;
  photo_url: string;
  door_location: string;
}) {
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      ...assessment,
      status: 'draft',
    })
    .select()
    .single();
  return { data: data as Assessment | null, error };
}

export async function updateAssessment(id: string, updates: Partial<Assessment>) {
  const { data, error } = await supabase
    .from('assessments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data: data as Assessment | null, error };
}

// Conservation Plans
export async function createConservationPlan(plan: Omit<ConservationPlan, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('conservation_plans')
    .insert(plan)
    .select()
    .single();
  return { data: data as ConservationPlan | null, error };
}

export async function updateConservationPlan(id: string, updates: Partial<ConservationPlan>) {
  const { data, error } = await supabase
    .from('conservation_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data: data as ConservationPlan | null, error };
}

// Approvals Functions
export async function getApprovals(approverRole?: string) {
  let query = supabase
    .from('approvals')
    .select(`
      *,
      approver:profiles!approvals_approver_id_fkey(*),
      assessment:assessments(
        *,
        site:sites(*),
        conservation_plan:conservation_plans(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (approverRole) {
    query = query.eq('approval_type', approverRole);
  }

  const { data, error } = await query;
  return { data: data as Approval[] | null, error };
}

export async function getPendingApprovals(userId: string, approvalType: string) {
  const { data, error } = await supabase
    .from('approvals')
    .select(`
      *,
      assessment:assessments(
        *,
        site:sites(*),
        conservation_plan:conservation_plans(*)
      )
    `)
    .eq('approver_id', userId)
    .eq('approval_type', approvalType)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return { data: data as Approval[] | null, error };
}

export async function createApproval(approval: {
  assessment_id: string;
  approver_id: string;
  approval_type: string;
}) {
  const { data, error } = await supabase
    .from('approvals')
    .insert({
      ...approval,
      status: 'pending',
    })
    .select()
    .single();
  return { data: data as Approval | null, error };
}

export async function updateApproval(id: string, status: 'approved' | 'rejected', comments?: string) {
  const { data, error } = await supabase
    .from('approvals')
    .update({ status, comments })
    .eq('id', id)
    .select()
    .single();
  return { data: data as Approval | null, error };
}

// Work Assignments
export async function getWorkAssignments(contractorId?: string) {
  let query = supabase
    .from('work_assignments')
    .select(`
      *,
      contractor:profiles!work_assignments_contractor_id_fkey(*),
      assigner:profiles!work_assignments_assigned_by_fkey(*),
      assessment:assessments(
        *,
        site:sites(*),
        conservation_plan:conservation_plans(*)
      )
    `)
    .order('assigned_at', { ascending: false });

  if (contractorId) {
    query = query.eq('contractor_id', contractorId);
  }

  const { data, error } = await query;
  return { data: data as WorkAssignment[] | null, error };
}

export async function createWorkAssignment(assignment: {
  assessment_id: string;
  contractor_id: string;
  assigned_by: string;
  due_date?: string;
}) {
  const { data, error } = await supabase
    .from('work_assignments')
    .insert(assignment)
    .select()
    .single();
  return { data: data as WorkAssignment | null, error };
}

export async function updateWorkAssignment(id: string, updates: Partial<WorkAssignment>) {
  const { data, error } = await supabase
    .from('work_assignments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data: data as WorkAssignment | null, error };
}

// File Upload
export async function uploadPhoto(file: File | Blob, fileName: string) {
  const { data, error } = await supabase.storage
    .from('door-photos')
    .upload(`assessments/${fileName}`, file, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) return { url: null, error };

  const { data: urlData } = supabase.storage
    .from('door-photos')
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl, error: null };
}
