import React, { useState, useEffect } from 'react';
import { UserAnswer } from '../../types';
import { analyzeQuizResults } from '../../services/geminiService';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuizResultsProps {
  results: UserAnswer[];
  onRetry: () => void;
  analysisContext: string;
}

const QuizResults: React.FC<QuizResultsProps> = ({ results, onRetry, analysisContext }) => {
  const [feedback, setFeedback] = useState<string>('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);

  const score = Math.round((results.filter(r => r.isCorrect).length / results.length) * 100);
  const incorrectAnswers = results.filter(r => !r.isCorrect);

  useEffect(() => {
    const getFeedback = async () => {
      setIsLoadingFeedback(true);
      const analysis = await analyzeQuizResults(incorrectAnswers, analysisContext);
      setFeedback(analysis);
      setIsLoadingFeedback(false);
    };
    getFeedback();
  }, [results, incorrectAnswers, analysisContext]);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6">
      <Card>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Quiz Complete!</h2>
          <p className="text-gray-500 mt-2">Your Score</p>
          <p className={`text-6xl font-bold mt-2 ${score > 80 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {score}%
          </p>
          <Button onClick={onRetry} className="mt-6">Create New Quiz</Button>
        </div>
      </Card>
      
      <Card>
        <h3 className="text-2xl font-bold mb-4 text-gray-900">AI-Powered Feedback</h3>
        {isLoadingFeedback ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
            <span className="ml-4 text-gray-500">Analyzing your results...</span>
          </div>
        ) : (
          <div className="prose max-w-none text-gray-700 bg-gray-100/70 p-4 rounded-md">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {feedback}
            </ReactMarkdown>
          </div>
        )}
      </Card>

      {incorrectAnswers.length > 0 && (
        <Card>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Review Your Mistakes</h3>
            <ul className="space-y-4">
                {incorrectAnswers.map((answer, index) => (
                    <li key={index} className="bg-gray-100 p-4 rounded-md border border-gray-200">
                        <p className="font-semibold text-gray-800">{answer.question}</p>
                        <p className="mt-2 text-sm text-red-600">
                          <span className="font-semibold">Your answer: </span>{answer.userAnswer}
                        </p>
                        <p className="mt-1 text-sm text-green-600">
                          <span className="font-semibold">Correct answer: </span>{answer.correctAnswer}
                        </p>
                    </li>
                ))}
            </ul>
        </Card>
      )}
    </div>
  );
};

export default QuizResults;