const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, name, fee_amount, due_date } = await req.json()

    if (!phone || !name || !due_date) {
      throw new Error('Missing required fields: phone, name, or due_date')
    }

    // Ensure phone number has country code (defaulting to 91 for India if missing)
    const cleanPhone = phone.replace(/\D/g, '');
    const toPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    const response = await fetch(`https://graph.facebook.com/v19.0/${Deno.env.get('PHONE_NUMBER_ID')}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('WHATSAPP_TOKEN')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'template',
        template: {
          name: 'fee_reminder',
          language: { code: 'en' },
          components: [{
            type: 'body',
            parameters: [
              { type: 'text', text: name },
              { type: 'text', text: String(fee_amount || 0) },
              { type: 'text', text: due_date }
            ]
          }]
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
});