import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create Supabase client with service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { receiptId } = await req.json();

    if (!receiptId) {
      return new Response(
        JSON.stringify({ error: 'Receipt ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get receipt from database
    const { data: receipt, error: fetchError } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', receiptId)
      .single();

    if (fetchError || !receipt) {
      console.error('Error fetching receipt:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Receipt not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to parsing
    await supabase
      .from('receipts')
      .update({ parse_status: 'parsing' })
      .eq('id', receiptId);

    let parsedData;
    
    if (openAIApiKey) {
      // Use OpenAI Vision API for parsing
      parsedData = await parseReceiptWithAI(receipt.file_url);
    } else {
      // Use mock data for development
      parsedData = generateMockReceiptData();
    }

    // Update receipt with parsed data
    const { error: updateError } = await supabase
      .from('receipts')
      .update({
        vendor: parsedData.vendor,
        invoice_no: parsedData.invoice_no,
        invoice_date: parsedData.invoice_date,
        currency: parsedData.currency,
        subtotal: parsedData.subtotal,
        tax: parsedData.tax,
        total: parsedData.total,
        raw_data: parsedData,
        parse_status: 'completed'
      })
      .eq('id', receiptId);

    if (updateError) {
      console.error('Error updating receipt:', updateError);
      await supabase
        .from('receipts')
        .update({ parse_status: 'error' })
        .eq('id', receiptId);
      
      return new Response(
        JSON.stringify({ error: 'Failed to update receipt' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create expense entries
    if (parsedData.items && parsedData.items.length > 0) {
      // Create individual expenses for each item
      const expenses = parsedData.items.map((item: any) => ({
        user_id: receipt.user_id,
        receipt_id: receiptId,
        date: parsedData.invoice_date,
        category: item.category || 'Tjetër',
        description: item.description,
        amount: item.line_total,
        currency: parsedData.currency,
        vendor: parsedData.vendor
      }));

      const { error: expenseError } = await supabase
        .from('expenses')
        .insert(expenses);

      if (expenseError) {
        console.error('Error creating expenses:', expenseError);
      }
    } else {
      // Create single expense from total
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert([{
          user_id: receipt.user_id,
          receipt_id: receiptId,
          date: parsedData.invoice_date,
          category: categorizeExpense(parsedData.vendor),
          description: `Purchase from ${parsedData.vendor}`,
          amount: parsedData.total,
          currency: parsedData.currency,
          vendor: parsedData.vendor
        }]);

      if (expenseError) {
        console.error('Error creating expense:', expenseError);
      }
    }

    return new Response(
      JSON.stringify(parsedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-receipt function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function parseReceiptWithAI(imageUrl: string) {
  const systemPrompt = `Ti je një parser faturash. Kthe JSON strikt sipas skemës më poshtë. Mos shto tekst tjetër.
Schema:
{
  "vendor": "string",
  "invoice_no": "string|null",
  "invoice_date": "YYYY-MM-DD",
  "currency": "ISO 4217",
  "items": [
    {"description":"string","qty":1,"unit_price":0.0,"line_total":0.0,"category":"auto"}
  ],
  "subtotal": 0.0,
  "tax": 0.0,
  "total": 0.0,
  "guessed_categories": true
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: 'Lexo faturën dhe kthe JSON' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsedData = JSON.parse(content);
    
    // Auto-categorize items if not already categorized
    if (parsedData.items) {
      parsedData.items = parsedData.items.map((item: any) => ({
        ...item,
        category: item.category === 'auto' ? categorizeExpense(item.description) : item.category
      }));
    }
    
    return parsedData;
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError);
    throw new Error('Invalid JSON response from OpenAI');
  }
}

function generateMockReceiptData() {
  const mockData = {
    vendor: "Conad Supermarket",
    invoice_no: `INV-${Math.floor(Math.random() * 100000)}`,
    invoice_date: new Date().toISOString().split('T')[0],
    currency: "EUR",
    items: [
      {
        description: "Pane i freskët",
        qty: 2,
        unit_price: 1.50,
        line_total: 3.00,
        category: "Ushqim"
      },
      {
        description: "Qumësht i plotë",
        qty: 1,
        unit_price: 2.20,
        line_total: 2.20,
        category: "Ushqim"
      },
      {
        description: "Mollë të kuqe",
        qty: 1,
        unit_price: 3.50,
        line_total: 3.50,
        category: "Ushqim"
      }
    ],
    subtotal: 8.70,
    tax: 1.74,
    total: 10.44,
    guessed_categories: true
  };

  return mockData;
}

function categorizeExpense(text: string): string {
  if (!text) return 'Tjetër';
  
  const lowerText = text.toLowerCase();
  const categories = {
    'ushqim': ['market', 'supermarket', 'conad', 'lidl', 'carrefour', 'food', 'restaurant', 'bar', 'cafe', 'pane', 'qumësht', 'ushqim'],
    'transport': ['uber', 'taxi', 'bus', 'train', 'metro', 'benzinë', 'transport', 'parking'],
    'teknologji': ['apple', 'microsoft', 'google', 'amazon', 'netflix', 'spotify', 'teknologji', 'software'],
    'argëtim': ['playstation', 'xbox', 'cinema', 'theater', 'concert', 'sport', 'argëtim', 'entertainment'],
    'shëndetësi': ['farmaci', 'mjek', 'spital', 'dentist', 'shëndet', 'health', 'medicine'],
    'veshmbathje': ['zara', 'h&m', 'nike', 'adidas', 'fashion', 'clothing', 'veshje']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }

  return 'Tjetër';
}