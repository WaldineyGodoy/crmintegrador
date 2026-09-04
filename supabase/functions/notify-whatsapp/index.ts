import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { project_id, installer_id } = await req.json()

    if (!project_id || !installer_id) {
      throw new Error('Missing required fields: project_id or installer_id')
    }

    // Buscar telefone e nome do instalador
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('marketplace_data, auth_users:id(raw_user_meta_data)')
      .eq('id', installer_id)
      .single();

    if (profileError || !profile) {
      throw new Error(`Installer profile not found: ${profileError?.message}`);
    }

    const phone = profile.marketplace_data?.phone;
    const name = profile.marketplace_data?.name || profile.auth_users?.raw_user_meta_data?.name || 'Instalador';

    if (!phone) {
      console.warn(`No phone number found for installer ${installer_id}. Aborting notification.`);
      return new Response(JSON.stringify({ success: false, reason: 'No phone number' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    let cleanPhone = phone.replace(/\D/g, '');
    if ((cleanPhone.length === 10 || cleanPhone.length === 11) && !cleanPhone.startsWith('55')) {
      cleanPhone = `55${cleanPhone}`;
    }

    // Configuração Evolution API
    const endpoint = Deno.env.get('EVOLUTION_API_ENDPOINT');
    const apiKey = Deno.env.get('EVOLUTION_API_KEY');
    const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME') || 'default';

    if (!endpoint || !apiKey) {
       console.warn('Evolution API not configured. Skipping WhatsApp message.');
       return new Response(JSON.stringify({ success: false, reason: 'Evolution API not configured' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
       });
    }

    const text = `Olá ${name}, você foi assinalado a um novo projeto de instalação! Acesse o CRM Integrador para visualizar os detalhes.`;

    const baseUrl = endpoint.replace(/\/+$/, '');
    const encodedInstance = encodeURIComponent(instanceName);
    const targetUrl = `${baseUrl}/message/sendText/${encodedInstance}`;

    const body = {
      number: cleanPhone,
      text: text,
      delay: 1200,
      linkPreview: false
    };

    console.log(`Sending WhatsApp to ${cleanPhone} via instance ${instanceName}`);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorRaw = await response.text();
      throw new Error(`Evolution API Error [${response.status}]: ${errorRaw}`);
    }

    const resData = await response.json();
    console.log('Evolution API Success:', resData);

    return new Response(JSON.stringify({ success: true, apiResponse: resData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
