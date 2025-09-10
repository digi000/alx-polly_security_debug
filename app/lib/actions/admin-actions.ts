'use server';

import { createClient } from '@/lib/supabase/server';

export async function getAllPolls() {
  const supabase = await createClient();
  
  // Get current user and verify admin role
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { polls: [], error: 'Authentication required' };
  }

  // Check if user has admin role
  const role = user.user_metadata?.role;
  if (role !== 'admin') {
    return { polls: [], error: 'Admin access required' };
  }

  // Fetch all polls if user is admin
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { polls: [], error: error.message };
  }

  return { polls: data || [], error: null };
}

export async function adminDeletePoll(pollId: string) {
  const supabase = await createClient();
  
  // Get current user and verify admin role
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Authentication required' };
  }

  // Check if user has admin role
  const role = user.user_metadata?.role;
  if (role !== 'admin') {
    return { error: 'Admin access required' };
  }

  // Delete poll as admin
  const { error } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
