import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://jecrbtcpizubxbqgiqie.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplY3JidGNwaXp1YnhicWdpcWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4MjIwODUsImV4cCI6MjExMDM5ODA4NX0.xy9yIdxW5_W2LGDFjNWOYSD_k8WCb5pVKVIS6O4iAD0'
);
