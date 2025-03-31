'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Lightbulb, ArrowRight, CheckCircle, RefreshCw, AlertCircle, ChevronDown, ChevronUp, TrendingUp, Star } from 'lucide-react';

interface QuestionRating {
  question: string;
  rating: number;
  notes?: string;
}

interface FeedbackInsightsProps {
  feedback: string;
  role: string;
  level: string;
  rating: number;
  questionRatings?: QuestionRating[];  // Add questionRatings prop
}

const FeedbackInsights = ({ feedback, role, level, rating, questionRatings = [] }: FeedbackInsightsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<{
    strengths: string[];
    areasToImprove: string[];
    nextSteps: string[];
    analysis: string;
  } | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [showQuestionRatings, setShowQuestionRatings] = useState(true);

  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-feedback',
          role,
          level,
          techstack: [],
          notes: feedback,
          ratings: [
            { category: 'Overall Performance', score: rating },
            ...questionRatings.map(qr => ({ 
              category: `Question: ${qr.question.length > 50 ? qr.question.substring(0, 50) + '...' : qr.question}`, 
              score: qr.rating 
            }))
          ]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setInsights({
        strengths: data.strengths || [],
        areasToImprove: data.improvements || [],
        nextSteps: data.nextSteps || [
          "Practice coding problems related to your tech stack",
          "Research the areas for improvement mentioned in feedback",
          "Work on side projects to build practical experience"
        ],
        analysis: data.feedback || ''
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Generate insights when component mounts
    generateInsights();
  }, [feedback, role, level, rating, questionRatings]);

  // Helper function to get a description for a rating
  const getRatingDescription = (rating: number): string => {
    if (rating === 5) return "Excellent";
    if (rating === 4) return "Good";
    if (rating === 3) return "Satisfactory";
    if (rating === 2) return "Basic";
    if (rating === 1) return "Poor";
    return "Not rated";
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      <div 
        className="p-4 bg-blue-50 dark:bg-blue-900/20 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold">AI-Generated Insights</h3>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>
      
      {expanded && (
        <div className="p-5">
          {questionRatings.length > 0 && (
            <div className="mb-5">
              <div 
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => setShowQuestionRatings(!showQuestionRatings)}
              >
                <h4 className="text-lg font-medium flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Question Ratings
                </h4>
                {showQuestionRatings ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
              
              {showQuestionRatings && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="py-2 px-4 text-left">Question</th>
                          <th className="py-2 px-4 text-center w-28">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questionRatings.map((qr, index) => (
                          <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                            <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                              {qr.question}
                              {qr.notes && (
                                <div className="mt-1 text-xs text-gray-500 italic">
                                  Note: {qr.notes}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col items-center">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= qr.rating 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <div className="text-xs mt-1">
                                  {getRatingDescription(qr.rating)}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Analyzing your feedback...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={generateInsights}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          ) : insights ? (
            <div className="space-y-5">
              {insights.analysis && (
                <div>
                  <h4 className="text-lg font-medium mb-2 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                    Overall Analysis
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {insights.analysis}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="text-lg font-medium mb-2 text-green-600 dark:text-green-400">Strengths</h4>
                <ul className="space-y-2">
                  {insights.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-2 text-amber-600 dark:text-amber-400">Areas to Improve</h4>
                <ul className="space-y-2">
                  {insights.areasToImprove.map((area, index) => (
                    <li key={index} className="flex items-start">
                      <ArrowRight className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-2 text-blue-600 dark:text-blue-400">Recommended Next Steps</h4>
                <ul className="space-y-2">
                  {insights.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <ArrowRight className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateInsights}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Insights
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default FeedbackInsights; 