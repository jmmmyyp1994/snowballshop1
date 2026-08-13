import { createClient } from '@supabase/supabase-js';

// วาง URL และ Key จริงของคุณตรงนี้ได้เลยครับ (เอาเครื่องหมาย ' ' ครอบไว้)
const supabaseUrl = 'https://zztairhveqrjoazstwba.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dGFpcmh2ZXFyam9henN0d2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MzY0NzcsImV4cCI6MjEwMjExMjQ3N30.dVRUiO51hKwEAtCWanru4OGbY5MBtGx_JnE7_DO7ZTc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);