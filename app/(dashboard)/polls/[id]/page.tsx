import { getPollWithResults } from '@/app/lib/actions/poll-actions';
import { notFound } from 'next/navigation';
import PollDetailClient from './PollDetailClient';

export default async function PollDetailPage({ params }: { params: { id: string } }) {
  const { poll, results, userVote, error } = await getPollWithResults(params.id);

  if (error || !poll || !results) {
    notFound();
  }

  return (
    <PollDetailClient 
      poll={poll} 
      results={results} 
      userVote={userVote} 
      pollId={params.id}
    />
  );
}