-- Castle Door Conservation App - Database Schema
-- PostgreSQL / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('surveyor', 'conservation_officer', 'budget_holder', 'contractor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sites/Castles table
CREATE TABLE public.sites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials Catalog
CREATE TABLE public.materials_catalog (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  supplier TEXT NOT NULL,
  supplier_contact TEXT,
  heritage_grade TEXT NOT NULL CHECK (heritage_grade IN ('standard', 'conservation', 'museum')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments table
CREATE TABLE public.assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  photo_url TEXT NOT NULL,
  photo_taken_at TIMESTAMPTZ DEFAULT NOW(),
  door_type TEXT,
  door_location TEXT NOT NULL,
  ai_analysis JSONB,
  condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_surveyor', 'pending_conservation', 'pending_budget',
    'approved', 'rejected', 'in_progress', 'completed'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conservation Plans
CREATE TABLE public.conservation_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) UNIQUE NOT NULL,
  work_description TEXT NOT NULL,
  materials JSONB NOT NULL DEFAULT '[]',
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  effort_hours INTEGER NOT NULL DEFAULT 0,
  effort_level TEXT NOT NULL CHECK (effort_level IN ('low', 'medium', 'high', 'critical')),
  conservation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approvals
CREATE TABLE public.approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) NOT NULL,
  approver_id UUID REFERENCES public.profiles(id) NOT NULL,
  approval_type TEXT NOT NULL CHECK (approval_type IN ('surveyor', 'conservation', 'budget')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, approval_type)
);

-- Work Assignments
CREATE TABLE public.work_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) NOT NULL,
  contractor_id UUID REFERENCES public.profiles(id) NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
  completion_notes TEXT,
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_assessments_site_id ON public.assessments(site_id);
CREATE INDEX idx_assessments_status ON public.assessments(status);
CREATE INDEX idx_assessments_created_by ON public.assessments(created_by);
CREATE INDEX idx_approvals_assessment_id ON public.approvals(assessment_id);
CREATE INDEX idx_approvals_approver_id ON public.approvals(approver_id);
CREATE INDEX idx_work_assignments_contractor_id ON public.work_assignments(contractor_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conservation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials_catalog ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles, update their own
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Sites: All authenticated users can view sites
CREATE POLICY "Sites are viewable by authenticated users" ON public.sites
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage sites" ON public.sites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Materials Catalog: All can view, admins can manage
CREATE POLICY "Materials are viewable by authenticated users" ON public.materials_catalog
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage materials" ON public.materials_catalog
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Assessments: Users can view all, create own, update based on role
CREATE POLICY "Assessments are viewable by authenticated users" ON public.assessments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create assessments" ON public.assessments
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own assessments" ON public.assessments
  FOR UPDATE USING (auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'conservation_officer')));

-- Conservation Plans: Same as assessments
CREATE POLICY "Plans are viewable by authenticated users" ON public.conservation_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Plans can be created for user's assessments" ON public.conservation_plans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.assessments WHERE id = assessment_id AND created_by = auth.uid())
  );

-- Approvals: Approvers can manage their approvals
CREATE POLICY "Approvals are viewable by authenticated users" ON public.approvals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Approvers can manage approvals" ON public.approvals
  FOR ALL USING (
    auth.uid() = approver_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Work Assignments: Contractors can view their assignments
CREATE POLICY "Work assignments viewable by authenticated users" ON public.work_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authorized users can manage work assignments" ON public.work_assignments
  FOR ALL USING (
    auth.uid() IN (contractor_id, assigned_by) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'conservation_officer'))
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for assessments updated_at
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'surveyor')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Materials Catalog with Irish Heritage Suppliers
INSERT INTO public.materials_catalog (name, category, unit, unit_price, supplier, supplier_contact, heritage_grade, description) VALUES
('European Oak (Seasoned)', 'Timber', 'm³', 2500.00, 'Irish Oak Furniture', 'info@irishoakfurniture.ie', 'conservation', 'Kiln-dried European oak suitable for heritage door restoration'),
('Hand-forged Door Hinges', 'Ironmongery', 'pair', 180.00, 'The Blacksmith Shop', 'orders@blacksmithshop.ie', 'conservation', 'Traditional hand-forged wrought iron hinges'),
('Traditional Lime Mortar', 'Masonry', '25kg bag', 35.00, 'Clogrennane Lime', 'sales@clogrennane.ie', 'conservation', 'Hydraulic lime mortar for heritage buildings'),
('Linseed Oil (Cold-pressed)', 'Finishes', '5L', 85.00, 'Traditional Paint', 'info@traditionalpaint.ie', 'conservation', 'Pure cold-pressed linseed oil for timber treatment'),
('Beeswax Polish', 'Finishes', '500ml', 25.00, 'Irish Beeswax', 'contact@irishbeeswax.ie', 'standard', 'Natural beeswax furniture and door polish'),
('Wrought Iron Studs', 'Ironmongery', 'pack of 100', 220.00, 'Heritage Ironworks', 'info@heritageiron.ie', 'conservation', 'Decorative wrought iron door studs'),
('Conservation Wood Filler', 'Repair', '1L', 45.00, 'Repair Care', 'sales@repaircare.ie', 'museum', 'Two-part epoxy wood filler for structural repairs'),
('Period Door Handles', 'Ironmongery', 'each', 150.00, 'Architectural Heritage', 'info@archheritage.ie', 'conservation', 'Reproduction medieval door handles'),
('Elm Timber (Seasoned)', 'Timber', 'm³', 1800.00, 'Sustainable Woods Ireland', 'info@sustainablewoods.ie', 'conservation', 'Reclaimed and sustainably sourced elm'),
('Iron Oxide Pigments', 'Finishes', '1kg', 45.00, 'Traditional Paint', 'info@traditionalpaint.ie', 'conservation', 'Natural iron oxide pigments for paint mixing'),
('Hand-forged Nails', 'Ironmongery', 'pack of 50', 65.00, 'The Blacksmith Shop', 'orders@blacksmithshop.ie', 'museum', 'Square-cut hand-forged iron nails'),
('Oak Pegs', 'Timber', 'pack of 100', 35.00, 'Irish Oak Furniture', 'info@irishoakfurniture.ie', 'conservation', 'Traditional oak dowels for joinery'),
('Copper Door Plate', 'Ironmongery', 'each', 95.00, 'Heritage Ironworks', 'info@heritageiron.ie', 'conservation', 'Hand-beaten copper decorative plates'),
('Tung Oil', 'Finishes', '5L', 95.00, 'Traditional Paint', 'info@traditionalpaint.ie', 'conservation', 'Natural tung oil wood finish'),
('Lime Wash', 'Finishes', '10L', 55.00, 'Clogrennane Lime', 'sales@clogrennane.ie', 'standard', 'Traditional lime wash for masonry');
