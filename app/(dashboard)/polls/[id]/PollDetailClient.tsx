'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { submitVote } from '@/app/lib/actions/poll-actions';
import { useAuth } from '@/app/lib/context/auth-context';

interface PollDetailClientProps {
  poll: any;
  results: any[];
  userVote: number | null;
  pollId: string;
}

export default function PollDetailClient({ poll, results, userVote, pollId }: PollDetailClientProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(userVote !== null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const totalVotes = results.reduce((sum, option) => sum + option.votes, 0);

  const handleVote = async () => {
    if (selectedOption === null) return;
    
    setIsSubmitting(true);
    setError(null);
    
    const result = await submitVote(pollId, selectedOption);
    
    if (result.error) {
      setError(result.error);
    } else {
      setHasVoted(true);
      // Refresh the page to show updated results
      window.location.reload();
    }
    
    setIsSubmitting(false);
  };

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/polls" className="text-blue-600 hover:underline">
          &larr; Back to Polls
        </Link>
        {user && user.id === poll.user_id && (
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/polls/${pollId}/edit`}>Edit Poll</Link>
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.question}</CardTitle>
          <CardDescription>{poll.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasVoted && user ? (
            <div className="space-y-3">
              <h3 className="font-medium">Select an option:</h3>
              {results.map((option) => (
                <div 
                  key={option.id} 
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedOption === option.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  {option.text}
                </div>
              ))}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button 
                onClick={handleVote} 
                disabled={selectedOption === null || isSubmitting} 
                className="mt-4"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Results:</h3>
              {results.map((option) => (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      {option.text}
                      {hasVoted && userVote === option.id && <span className="text-blue-600 ml-2">(Your vote)</span>}
                    </span>
                    <span>{getPercentage(option.votes)}% ({option.votes} votes)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${getPercentage(option.votes)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="text-sm text-slate-500 pt-2">
                Total votes: {totalVotes}
              </div>
              {!user && (
                <p className="text-sm text-gray-500">
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Login
                  </Link> to vote on this poll.
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-slate-500 flex justify-between">
          <span>Poll ID: {poll.id}</span>
          <span>Created: {new Date(poll.created_at).toLocaleDateString()}</span>
        </CardFooter>
      </Card>
    </div>
  );
}
