import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  createConservationPlan,
  uploadPhoto,
} from '@/services/supabase';
import { analyzeDoorImage, fileToBase64, getMediaType } from '@/services/claude';
import {
  isDemoMode,
  getDemoAssessments,
  getDemoAssessment,
  addDemoAssessment,
  updateDemoAssessment,
  demoSites,
  getDemoUser,
} from '@/services/demoData';
import type { Assessment, ConservationPlan, AIAnalysis } from '@/types';

export function useAssessments(status?: string) {
  return useQuery({
    queryKey: ['assessments', status],
    queryFn: async () => {
      if (isDemoMode()) {
        let assessments = getDemoAssessments();
        if (status) {
          assessments = assessments.filter(a => a.status === status);
        }
        return assessments;
      }

      const { data, error } = await getAssessments(status);
      if (error) throw error;
      return data;
    },
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: ['assessment', id],
    queryFn: async () => {
      if (isDemoMode()) {
        return getDemoAssessment(id);
      }

      const { data, error } = await getAssessment(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useSites() {
  return useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      if (isDemoMode()) {
        return demoSites;
      }

      const { getSites } = await import('@/services/supabase');
      const { data, error } = await getSites();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      siteId,
      doorLocation,
      photo,
      userId,
    }: {
      siteId: string;
      doorLocation: string;
      photo: File;
      userId: string;
    }) => {
      if (isDemoMode()) {
        // Create a demo assessment
        const site = demoSites.find(s => s.id === siteId);
        const user = getDemoUser();
        const photoUrl = URL.createObjectURL(photo);

        const newAssessment: Assessment = {
          id: `assess-demo-${Date.now()}`,
          site_id: siteId,
          created_by: userId,
          photo_url: photoUrl,
          photo_taken_at: new Date().toISOString(),
          door_type: '',
          door_location: doorLocation,
          ai_analysis: null,
          condition_rating: 3,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          site: site,
          creator: user || undefined,
        };

        addDemoAssessment(newAssessment);
        return newAssessment;
      }

      // Production mode
      const fileName = `${userId}-${Date.now()}.jpg`;
      const { url, error: uploadError } = await uploadPhoto(photo, fileName);
      if (uploadError || !url) {
        throw new Error('Failed to upload photo');
      }

      const { data: assessment, error: assessmentError } = await createAssessment({
        site_id: siteId,
        created_by: userId,
        photo_url: url,
        door_location: doorLocation,
      });

      if (assessmentError || !assessment) {
        throw new Error('Failed to create assessment');
      }

      return assessment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
  });
}

export function useAnalyzeDoor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assessmentId,
      photo,
    }: {
      assessmentId: string;
      photo: File;
    }): Promise<AIAnalysis> => {
      // Call Claude Vision via Supabase Edge Function (API key is server-side)
      const base64 = await fileToBase64(photo);
      const mediaType = getMediaType(photo);
      const analysis = await analyzeDoorImage(base64, mediaType);

      // Update the assessment with AI analysis results
      if (isDemoMode()) {
        updateDemoAssessment(assessmentId, {
          ai_analysis: analysis,
          door_type: analysis.door_type,
          condition_rating: getConditionRating(analysis.urgency_level),
        });
      } else {
        await updateAssessment(assessmentId, {
          ai_analysis: analysis,
          door_type: analysis.door_type,
          condition_rating: getConditionRating(analysis.urgency_level),
        });
      }

      return analysis;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assessment', variables.assessmentId] });
    },
  });
}

export function useCreateConservationPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: Omit<ConservationPlan, 'id' | 'created_at'>) => {
      if (isDemoMode()) {
        const newPlan: ConservationPlan = {
          ...plan,
          id: `plan-demo-${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        updateDemoAssessment(plan.assessment_id, {
          conservation_plan: newPlan,
        });

        return newPlan;
      }

      const { data, error } = await createConservationPlan(plan);
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assessment', variables.assessment_id] });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Assessment> }) => {
      if (isDemoMode()) {
        return updateDemoAssessment(id, updates);
      }

      const { data, error } = await updateAssessment(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assessment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
  });
}

function getConditionRating(urgency: string): 1 | 2 | 3 | 4 | 5 {
  switch (urgency) {
    case 'critical':
      return 1;
    case 'high':
      return 2;
    case 'medium':
      return 3;
    case 'low':
      return 4;
    default:
      return 3;
  }
}
