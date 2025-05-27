import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a custom fetch function that includes the service role key
const customFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`
    }
  });
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  global: {
    fetch: customFetch
  }
})