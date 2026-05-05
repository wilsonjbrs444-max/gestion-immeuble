import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wslgboycfpnsjrycbvly.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbGdib3ljZnBuc2pyeWNidmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NzIwNDQsImV4cCI6MjA5MzM0ODA0NH0.RRdUq7Vi8O31akX4gA_YjV2ZUoj71XHHfU5E73c4Tck'

export const supabase = createClient(supabaseUrl, supabaseKey)
