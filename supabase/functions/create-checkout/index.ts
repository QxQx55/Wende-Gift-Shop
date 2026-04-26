import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { items, success_url, cancel_url } = await req.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid items in request')
    }

    // Server-side validation: Fetch actual prices from database to prevent manipulation
    const productIds = items.map((item: any) => item.id)
    const { data: dbProducts, error: dbError } = await supabaseClient
      .from('products')
      .select('id, name, price, image')
      .in('id', productIds)

    if (dbError || !dbProducts) {
      throw new Error('Could not verify products')
    }

    const lineItems = items.map((item: any) => {
      const dbProduct = dbProducts.find((p: any) => p.id === item.id)
      if (!dbProduct) {
        throw new Error(`Product with ID ${item.id} not found`)
      }
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: dbProduct.name,
            images: [dbProduct.image],
          },
          unit_amount: Math.round(dbProduct.price * 100),
        },
        quantity: Math.max(1, parseInt(item.quantity) || 1),
      }
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: success_url || `${req.headers.get('origin')}/success`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/cart`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
      },
    })

    return new Response(
      JSON.stringify({ id: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Checkout Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An internal error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})