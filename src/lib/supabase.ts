import { createClient } from '@supabase/supabase-js';

// Current project Supabase connection
const supabaseUrl = 'https://pjowlaedxcauwagegbco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb3dsYWVkeGNhdXdhZ2VnYmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTgwNTIsImV4cCI6MjA5MDAzNDA1Mn0.1ImAqT5U0XaZ021ZJKOV6PeF-1sK4Pufa_g-yCWY-aE';

export const supabase = createClient(supabaseUrl, supabaseKey);
