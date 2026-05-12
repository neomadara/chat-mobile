import { createClient } from '@supabase/supabase-js'

let supabase = null

export function initSupabase({ url, anonKey }) {
  if (!url || !anonKey) {
    throw new Error('Faltan url o anonKey para inicializar Supabase')
  }

  if (!supabase) {
    supabase = createClient(url, anonKey)
  }

  return supabase
}

export function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase no fue inicializado. Llama a initSupabase primero.')
  }

  return supabase
}