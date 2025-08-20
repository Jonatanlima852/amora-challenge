import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ Adicionar logs para debug
console.log('Supabase URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado')
console.log('Supabase Key:', supabaseAnonKey ? '✅ Configurado' : '❌ Não configurado')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
