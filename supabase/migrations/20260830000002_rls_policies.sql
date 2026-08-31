-- Idempotency drops
DROP POLICY IF EXISTS "Installer can read assigned project" ON public.projects;
DROP POLICY IF EXISTS "Installer can edit assigned installation" ON public.project_installations;
DROP POLICY IF EXISTS "Everyone can see installers in marketplace" ON public.profiles;
DROP POLICY IF EXISTS "Integrators can access proposals" ON public.project_proposals;

-- Instaladores podem ler os projetos onde estão designados
CREATE POLICY "Installer can read assigned project"
  ON public.projects FOR SELECT
  USING (auth.uid() = assigned_installer_id);

-- Instaladores podem editar a aba de instalação de seus projetos
CREATE POLICY "Installer can edit assigned installation"
  ON public.project_installations FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE assigned_installer_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE assigned_installer_id = auth.uid()
    )
  );

-- Gestores/Integradores podem ver todos os prestadores do marketplace
CREATE POLICY "Everyone can see installers in marketplace"
  ON public.profiles FOR SELECT
  USING (role = 'Instalador');

-- Apenas responsáveis (Integradores/Gestores) podem ver/editar propostas (bloqueado para instaladores)
CREATE POLICY "Integrators can access proposals"
  ON public.project_proposals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('Integrador', 'Gestor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('Integrador', 'Gestor')
    )
  );
