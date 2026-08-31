-- Habilita extensão para fazer requisições HTTP a partir do Postgres
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_installer_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_installer_id IS NOT NULL AND OLD.assigned_installer_id IS DISTINCT FROM NEW.assigned_installer_id THEN
    -- Chama a Edge Function do Supabase (que depois chama a Evolution API)
    PERFORM net.http_post(
        url := 'https://[PROJECT_REF].supabase.co/functions/v1/notify-whatsapp',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
        body := json_build_object('project_id', NEW.id, 'installer_id', NEW.assigned_installer_id)::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_installer_assigned ON public.projects;
CREATE TRIGGER on_installer_assigned
  AFTER UPDATE OF assigned_installer_id ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_installer_assignment();
