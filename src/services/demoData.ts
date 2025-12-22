import type {
  User,
  Site,
  Assessment,
  MaterialCatalogItem,
  Approval,
  ConservationPlan,
} from '@/types';

// Demo Users
export const demoUsers: User[] = [
  {
    id: 'user-1',
    email: 'sean.murphy@conservation.ie',
    name: 'Sean Murphy',
    role: 'surveyor',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user-2',
    email: 'aoife.brennan@heritage.ie',
    name: 'Aoife Brennan',
    role: 'conservation_officer',
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'user-3',
    email: 'patrick.kelly@budgets.ie',
    name: 'Patrick Kelly',
    role: 'budget_holder',
    created_at: '2024-01-05T10:00:00Z',
  },
  {
    id: 'user-4',
    email: 'mary.oconnor@ironworks.ie',
    name: 'Mary O\'Connor',
    role: 'contractor',
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'user-5',
    email: 'admin@castles.ie',
    name: 'Admin User',
    role: 'admin',
    created_at: '2024-01-01T10:00:00Z',
  },
];

// Demo Sites
export const demoSites: Site[] = [
  {
    id: 'site-1',
    name: 'Bunratty Castle',
    location: 'County Clare',
    description: 'A 15th-century tower house in County Clare, Ireland.',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'site-2',
    name: 'Ross Castle',
    location: 'County Kerry',
    description: 'A 15th-century tower house on the edge of Lough Leane.',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'site-3',
    name: 'Dunluce Castle',
    location: 'County Antrim',
    description: 'A now-ruined medieval castle on the Antrim coast.',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'site-4',
    name: 'Kilkenny Castle',
    location: 'County Kilkenny',
    description: 'A castle in Kilkenny, Ireland built in 1195.',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'site-5',
    name: 'Cahir Castle',
    location: 'County Tipperary',
    description: 'One of the largest castles in Ireland, on an island in the River Suir.',
    created_at: '2024-01-01T10:00:00Z',
  },
];

// Demo Materials
export const demoMaterials: MaterialCatalogItem[] = [
  {
    id: 'mat-1',
    name: 'European Oak (Seasoned)',
    category: 'Timber',
    unit: 'm³',
    unit_price: 2500,
    supplier: 'Irish Oak Furniture',
    supplier_contact: 'info@irishoakfurniture.ie',
    heritage_grade: 'conservation',
    description: 'Kiln-dried European oak suitable for heritage door restoration',
  },
  {
    id: 'mat-2',
    name: 'Hand-forged Door Hinges',
    category: 'Ironmongery',
    unit: 'pair',
    unit_price: 180,
    supplier: 'The Blacksmith Shop',
    supplier_contact: 'orders@blacksmithshop.ie',
    heritage_grade: 'conservation',
    description: 'Traditional hand-forged wrought iron hinges',
  },
  {
    id: 'mat-3',
    name: 'Traditional Lime Mortar',
    category: 'Masonry',
    unit: '25kg bag',
    unit_price: 35,
    supplier: 'Clogrennane Lime',
    supplier_contact: 'sales@clogrennane.ie',
    heritage_grade: 'conservation',
    description: 'Hydraulic lime mortar for heritage buildings',
  },
  {
    id: 'mat-4',
    name: 'Linseed Oil (Cold-pressed)',
    category: 'Finishes',
    unit: '5L',
    unit_price: 85,
    supplier: 'Traditional Paint',
    supplier_contact: 'info@traditionalpaint.ie',
    heritage_grade: 'conservation',
    description: 'Pure cold-pressed linseed oil for timber treatment',
  },
  {
    id: 'mat-5',
    name: 'Beeswax Polish',
    category: 'Finishes',
    unit: '500ml',
    unit_price: 25,
    supplier: 'Irish Beeswax',
    supplier_contact: 'contact@irishbeeswax.ie',
    heritage_grade: 'standard',
    description: 'Natural beeswax furniture and door polish',
  },
  {
    id: 'mat-6',
    name: 'Wrought Iron Studs',
    category: 'Ironmongery',
    unit: 'pack of 100',
    unit_price: 220,
    supplier: 'Heritage Ironworks',
    supplier_contact: 'info@heritageiron.ie',
    heritage_grade: 'conservation',
    description: 'Decorative wrought iron door studs',
  },
  {
    id: 'mat-7',
    name: 'Conservation Wood Filler',
    category: 'Repair',
    unit: '1L',
    unit_price: 45,
    supplier: 'Repair Care',
    supplier_contact: 'sales@repaircare.ie',
    heritage_grade: 'museum',
    description: 'Two-part epoxy wood filler for structural repairs',
  },
  {
    id: 'mat-8',
    name: 'Period Door Handles',
    category: 'Ironmongery',
    unit: 'each',
    unit_price: 150,
    supplier: 'Architectural Heritage',
    supplier_contact: 'info@archheritage.ie',
    heritage_grade: 'conservation',
    description: 'Reproduction medieval door handles',
  },
  {
    id: 'mat-9',
    name: 'Elm Timber (Seasoned)',
    category: 'Timber',
    unit: 'm³',
    unit_price: 1800,
    supplier: 'Sustainable Woods Ireland',
    supplier_contact: 'info@sustainablewoods.ie',
    heritage_grade: 'conservation',
    description: 'Reclaimed and sustainably sourced elm',
  },
  {
    id: 'mat-10',
    name: 'Hand-forged Nails',
    category: 'Ironmongery',
    unit: 'pack of 50',
    unit_price: 65,
    supplier: 'The Blacksmith Shop',
    supplier_contact: 'orders@blacksmithshop.ie',
    heritage_grade: 'museum',
    description: 'Square-cut hand-forged iron nails',
  },
];

// Demo Conservation Plan
const demoPlan: ConservationPlan = {
  id: 'plan-1',
  assessment_id: 'assess-1',
  work_description: 'Complete restoration of the main entrance door including timber repairs, ironwork conservation, and protective finishing. The door requires stabilization of the lower rail where water ingress has caused rot, replacement of three damaged iron studs, and full re-treatment with linseed oil.',
  materials: [
    {
      material_id: 'mat-1',
      material_name: 'European Oak (Seasoned)',
      quantity: 0.15,
      unit: 'm³',
      unit_price: 2500,
      total_price: 375,
      supplier: 'Irish Oak Furniture',
      heritage_grade: 'conservation',
    },
    {
      material_id: 'mat-2',
      material_name: 'Hand-forged Door Hinges',
      quantity: 2,
      unit: 'pair',
      unit_price: 180,
      total_price: 360,
      supplier: 'The Blacksmith Shop',
      heritage_grade: 'conservation',
    },
    {
      material_id: 'mat-4',
      material_name: 'Linseed Oil (Cold-pressed)',
      quantity: 2,
      unit: '5L',
      unit_price: 85,
      total_price: 170,
      supplier: 'Traditional Paint',
      heritage_grade: 'conservation',
    },
    {
      material_id: 'mat-7',
      material_name: 'Conservation Wood Filler',
      quantity: 1,
      unit: '1L',
      unit_price: 45,
      total_price: 45,
      supplier: 'Repair Care',
      heritage_grade: 'museum',
    },
  ],
  total_cost: 950,
  effort_hours: 24,
  effort_level: 'medium',
  conservation_notes: 'All repairs must use traditional joinery techniques. No modern adhesives or fasteners. The original iron studs should be cleaned and re-treated rather than replaced where possible. Document all work with photographs.',
  created_at: '2024-11-20T14:00:00Z',
};

// Demo Assessments
export const demoAssessments: Assessment[] = [
  {
    id: 'assess-1',
    site_id: 'site-1',
    created_by: 'user-1',
    photo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    photo_taken_at: '2024-11-20T10:30:00Z',
    door_type: 'Oak plank door with iron studs',
    door_location: 'Main entrance, ground floor',
    ai_analysis: {
      door_type: 'Oak plank door with decorative iron studs and ring handle',
      estimated_age: '15th century, with Victorian-era repairs',
      condition_summary: 'The door shows significant weathering with water damage to the lower rail. The iron studs are partially corroded but intact. The original oak planks remain structurally sound despite surface deterioration.',
      conservation_concerns: [
        'Water ingress at base causing rot',
        'Corrosion on iron hardware',
        'Previous inappropriate repairs with modern screws',
        'Loss of original surface finish',
      ],
      recommended_interventions: [
        'Carefully remove and document modern fixings',
        'Consolidate rotted timber with conservation-grade filler',
        'Clean and treat iron hardware with rust converter',
        'Apply traditional linseed oil finish',
        'Install discrete drip edge to prevent future water damage',
      ],
      heritage_considerations: [
        'Door retains original medieval construction',
        'Iron studs are hand-forged and historically significant',
        'Any replacement timber must match species and cut',
        'All work should be reversible where possible',
      ],
      urgency_level: 'medium',
    },
    condition_rating: 3,
    status: 'pending_conservation',
    created_at: '2024-11-20T11:00:00Z',
    updated_at: '2024-11-21T09:00:00Z',
    site: demoSites[0],
    creator: demoUsers[0],
    conservation_plan: demoPlan,
  },
  {
    id: 'assess-2',
    site_id: 'site-2',
    created_by: 'user-1',
    photo_url: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=800',
    photo_taken_at: '2024-11-18T14:00:00Z',
    door_type: 'Arched timber door',
    door_location: 'Tower entrance, first floor',
    ai_analysis: {
      door_type: 'Arched oak door with iron strap hinges',
      estimated_age: '16th century construction',
      condition_summary: 'Door is in fair condition with minor wear. The arch frame shows some settlement but remains stable. Hinges need attention.',
      conservation_concerns: [
        'Hinge pins showing wear',
        'Minor splitting in one plank',
        'Stone frame requires pointing',
      ],
      recommended_interventions: [
        'Replace worn hinge pins with hand-forged replicas',
        'Stabilize split with oak wedges',
        'Repoint stone frame with lime mortar',
      ],
      heritage_considerations: [
        'Retain all original ironwork',
        'Use traditional lime mortar only',
      ],
      urgency_level: 'low',
    },
    condition_rating: 4,
    status: 'approved',
    created_at: '2024-11-18T15:00:00Z',
    updated_at: '2024-11-19T10:00:00Z',
    site: demoSites[1],
    creator: demoUsers[0],
  },
  {
    id: 'assess-3',
    site_id: 'site-3',
    created_by: 'user-1',
    photo_url: 'https://images.unsplash.com/photo-1505662695280-5a4e2b685a2f?w=800',
    photo_taken_at: '2024-11-22T09:00:00Z',
    door_type: 'Damaged entrance door',
    door_location: 'Gatehouse, ground level',
    ai_analysis: {
      door_type: 'Heavy oak door with defensive iron banding',
      estimated_age: '14th century with later additions',
      condition_summary: 'Critical condition. Major structural failure in the lower third. Immediate stabilization required to prevent total loss.',
      conservation_concerns: [
        'Severe rot affecting 40% of door',
        'Iron bands detaching',
        'Door no longer closes properly',
        'Risk of collapse',
      ],
      recommended_interventions: [
        'Emergency temporary support',
        'Full timber assessment by specialist',
        'Consider partial reconstruction',
        'Archaeological recording before intervention',
      ],
      heritage_considerations: [
        'High historical significance - gatehouse door',
        'Requires archaeological supervision',
        'Any reconstruction must be documented',
      ],
      urgency_level: 'critical',
    },
    condition_rating: 1,
    status: 'pending_surveyor',
    created_at: '2024-11-22T10:00:00Z',
    updated_at: '2024-11-22T10:00:00Z',
    site: demoSites[2],
    creator: demoUsers[0],
  },
  {
    id: 'assess-4',
    site_id: 'site-4',
    created_by: 'user-1',
    photo_url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800',
    photo_taken_at: '2024-11-15T11:00:00Z',
    door_type: 'Interior oak door',
    door_location: 'Great Hall, east wing',
    ai_analysis: {
      door_type: 'Paneled oak door with carved details',
      estimated_age: '17th century',
      condition_summary: 'Good condition overall. Minor maintenance needed. The carved panels are well preserved.',
      conservation_concerns: [
        'Dust and grime accumulation',
        'Minor scratches on panels',
        'Lock mechanism stiff',
      ],
      recommended_interventions: [
        'Gentle cleaning with conservation wax',
        'Lubricate lock mechanism',
        'Apply protective wax finish',
      ],
      heritage_considerations: [
        'Carved details are artistically significant',
        'Original lock should be retained',
      ],
      urgency_level: 'low',
    },
    condition_rating: 5,
    status: 'completed',
    created_at: '2024-11-15T12:00:00Z',
    updated_at: '2024-11-17T16:00:00Z',
    site: demoSites[3],
    creator: demoUsers[0],
  },
  {
    id: 'assess-5',
    site_id: 'site-1',
    created_by: 'user-1',
    photo_url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800',
    photo_taken_at: '2024-11-23T08:00:00Z',
    door_type: 'Service entrance door',
    door_location: 'Kitchen wing, rear',
    ai_analysis: null,
    condition_rating: 3,
    status: 'draft',
    created_at: '2024-11-23T08:30:00Z',
    updated_at: '2024-11-23T08:30:00Z',
    site: demoSites[0],
    creator: demoUsers[0],
  },
];

// Demo Approvals
export const demoApprovals: Approval[] = [
  {
    id: 'approval-1',
    assessment_id: 'assess-1',
    approver_id: 'user-1',
    approval_type: 'surveyor',
    status: 'approved',
    comments: 'Site survey confirms AI assessment. Water damage is localized and repairable.',
    created_at: '2024-11-20T14:00:00Z',
    approver: demoUsers[0],
  },
  {
    id: 'approval-2',
    assessment_id: 'assess-1',
    approver_id: 'user-2',
    approval_type: 'conservation',
    status: 'pending',
    comments: null,
    created_at: '2024-11-21T09:00:00Z',
    approver: demoUsers[1],
  },
  {
    id: 'approval-3',
    assessment_id: 'assess-3',
    approver_id: 'user-1',
    approval_type: 'surveyor',
    status: 'pending',
    comments: null,
    created_at: '2024-11-22T10:30:00Z',
    approver: demoUsers[0],
  },
];

// Demo mode state management
let currentUser: User | null = null;
let assessments = [...demoAssessments];
let approvals = [...demoApprovals];

export function isDemoMode(): boolean {
  return !import.meta.env.VITE_SUPABASE_URL ||
         import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url' ||
         import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
}

export function getDemoUser(): User | null {
  return currentUser;
}

export function setDemoUser(user: User | null): void {
  currentUser = user;
  if (user) {
    localStorage.setItem('demo_user_id', user.id);
  } else {
    localStorage.removeItem('demo_user_id');
  }
}

export function initDemoUser(): User | null {
  const savedUserId = localStorage.getItem('demo_user_id');
  if (savedUserId) {
    const user = demoUsers.find(u => u.id === savedUserId);
    if (user) {
      currentUser = user;
      return user;
    }
  }
  return null;
}

export function getDemoAssessments(): Assessment[] {
  return assessments;
}

export function getDemoAssessment(id: string): Assessment | null {
  return assessments.find(a => a.id === id) || null;
}

export function addDemoAssessment(assessment: Assessment): void {
  assessments = [assessment, ...assessments];
}

export function updateDemoAssessment(id: string, updates: Partial<Assessment>): Assessment | null {
  const index = assessments.findIndex(a => a.id === id);
  if (index >= 0) {
    assessments[index] = { ...assessments[index], ...updates };
    return assessments[index];
  }
  return null;
}

export function getDemoApprovals(): Approval[] {
  return approvals;
}

export function getPendingDemoApprovals(userId: string, approvalType: string): Approval[] {
  return approvals.filter(
    a => a.approver_id === userId &&
         a.approval_type === approvalType &&
         a.status === 'pending'
  );
}

export function updateDemoApproval(id: string, status: 'approved' | 'rejected', comments?: string): Approval | null {
  const index = approvals.findIndex(a => a.id === id);
  if (index >= 0) {
    approvals[index] = { ...approvals[index], status, comments: comments || null };
    return approvals[index];
  }
  return null;
}
