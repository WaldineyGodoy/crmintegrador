CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    document TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id),
    integrator_company_id UUID,
    assigned_installer_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'lead',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.project_proposals (
    project_id UUID REFERENCES public.projects(id) PRIMARY KEY,
    total_value DECIMAL(12, 2),
    financing_approved BOOLEAN DEFAULT false
);

CREATE TABLE public.project_installations (
    project_id UUID REFERENCES public.projects(id) PRIMARY KEY,
    scheduled_date DATE,
    checklist JSONB DEFAULT '{}'::jsonb,
    installer_accepted BOOLEAN DEFAULT false
);

CREATE TABLE public.installer_availability (
    installer_id UUID REFERENCES public.profiles(id),
    blocked_date DATE NOT NULL,
    PRIMARY KEY (installer_id, blocked_date)
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installer_availability ENABLE ROW LEVEL SECURITY;
