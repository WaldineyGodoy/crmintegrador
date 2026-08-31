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
  );

-- Gestores/Integradores podem ver todos os prestadores do marketplace
CREATE POLICY "Everyone can see installers in marketplace"
  ON public.profiles FOR SELECT
  USING (role = 'Instalador');
