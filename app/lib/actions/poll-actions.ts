"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// CREATE POLL
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question,
      options,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/polls");
  return { error: null };
}

// GET USER POLLS
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

// GET POLL BY ID
export async function getPollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

// GET POLL WITH RESULTS
export async function getPollWithResults(id: string) {
  const supabase = await createClient();
  
  // Get poll data
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (pollError || !poll) {
    return { poll: null, results: null, userVote: null, error: pollError?.message || 'Poll not found' };
  }

  // Get vote counts for each option
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("option_index")
    .eq("poll_id", id);

  if (votesError) {
    return { poll: null, results: null, userVote: null, error: votesError.message };
  }

  // Calculate results
  const results = poll.options.map((option: string, index: number) => ({
    id: index,
    text: option,
    votes: votes?.filter(vote => vote.option_index === index).length || 0
  }));

  // Check if current user has voted
  const { data: { user } } = await supabase.auth.getUser();
  let userVote = null;
  
  if (user) {
    const { data: userVoteData } = await supabase
      .from("votes")
      .select("option_index")
      .eq("poll_id", id)
      .eq("user_id", user.id)
      .single();
    
    userVote = userVoteData?.option_index ?? null;
  }

  return { poll, results, userVote, error: null };
}

// SUBMIT VOTE
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Require authentication to vote
  if (!user) return { error: 'You must be logged in to vote.' };

  // Check if user has already voted on this poll
  const { data: existingVote, error: voteCheckError } = await supabase
    .from("votes")
    .select("id")
    .eq("poll_id", pollId)
    .eq("user_id", user.id)
    .single();

  if (voteCheckError && voteCheckError.code !== 'PGRST116') {
    return { error: voteCheckError.message };
  }

  if (existingVote) {
    return { error: 'You have already voted on this poll.' };
  }

  // Verify poll exists and is active
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("id, options")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    return { error: 'Poll not found.' };
  }

  // Verify option index is valid
  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return { error: 'Invalid option selected.' };
  }

  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user.id,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

// DELETE POLL
export async function deletePoll(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("polls").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/polls");
  return { error: null };
}

// UPDATE POLL
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // Only allow updating polls owned by the user
  const { error } = await supabase
    .from("polls")
    .update({ question, options })
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
