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
    const twilioTo = `whatsapp:+${toPhone}`;

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioFrom = Deno.env.get('TWILIO_PHONE_NUMBER'); // Should be like: whatsapp:+14155238886

    if (!accountSid || !authToken || !twilioFrom) {
      throw new Error('Missing Twilio credentials in environment variables');
    }

    const messageBody = `Hello ${name},\n\nThis is a friendly reminder that your gym fee of ₹${fee_amount} is due on ${due_date}. Please make the payment at your earliest convenience.\n\nThank you!\nFitBox Gym`;

    const details = {
      'To': twilioTo,
      'From': twilioFrom,
      'Body': messageBody
    };

    const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || JSON.stringify(data));
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