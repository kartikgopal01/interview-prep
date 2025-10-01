'use server';

import {db} from "@/firebase/admin";
import {generateObject} from "ai";
import { groq } from '@ai-sdk/groq';
import {feedbackSchema} from "@/constants";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db
        .collection('interviews')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    const interviews = await db
        .collection('interviews')
        .orderBy('createdAt', 'desc')
        .where('finalized', '==', true)
        .where('userId', '!=', userId)
        .limit(limit)
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
    const interview = await db
        .collection('interviews')
        .doc(id)
        .get();

    return interview.data() as Interview | null;
}

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript } = params;

    try {
        if (!Array.isArray(transcript) || transcript.length === 0) {
            return { success: false, error: 'Transcript is empty; cannot generate feedback' };
        }
        const formattedTranscript = transcript.map((sentence: { role: string, content: string }) => (
            `- ${sentence.role}: ${sentence.content}\n`
        )).join('');

        const { object } = await generateObject({
            model: groq('llama-3.3-70b-versatile', {}),
            schema: feedbackSchema,
            prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate with integer scores from 0 to 100 in the following exact categories (use these exact names, no additions or changes). Tailor the scores to the transcript content; do not default to the same values:
        - Communication Skills
        - Technical Knowledge
        - Problem Solving
        - Cultural Fit
        - Confidence and Clarity
        `,
            system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
        });

        // Compute total score from category scores to avoid model-defaulted totals
        const computedTotalScore = Array.isArray(object.categoryScores) && object.categoryScores.length > 0
            ? Math.round(
                object.categoryScores.reduce((sum: number, c: { score: number }) => sum + (c?.score || 0), 0) / object.categoryScores.length
              )
            : (typeof object.totalScore === 'number' ? Math.round(object.totalScore) : 0);

        const feedback = {
            interviewId,
            userId,
            totalScore: computedTotalScore,
            categoryScores: object.categoryScores,
            strengths: object.strengths,
            areasForImprovement: object.areasForImprovement,
            finalAssessment: object.finalAssessment,
            createdAt: new Date().toISOString()
        }

        const newFeedback = await db.collection('feedback')
            .add(feedback)

        return { success: true, feedbackId: newFeedback.id };
    } catch (e) {
        console.log('Error saving feedback', e)

        return { success: false }
    }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    const feedback = await db
        .collection('feedback')
        .where('interviewId', '==', interviewId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

    if(feedback.empty) return null;
    const feedbackDoc = feedback.docs[0];

    return { id: feedbackDoc.id, ...feedbackDoc.data()} as Feedback;
}

export const deleteInterview = async (interviewId: string, userId: string) => {
  try {
    // Check if the user is the creator of the interview
    const interview = await db
      .collection('interviews')
      .doc(interviewId)
      .get();

    if (!interview.exists) {
      throw new Error("Interview not found");
    }

    const interviewData = interview.data() as Interview;
    if (interviewData.userId !== userId) {
      throw new Error("You are not authorized to delete this interview");
    }

    // Delete associated feedback first
    const feedbackQuery = await db
      .collection('feedback')
      .where('interviewId', '==', interviewId)
      .get();

    const batch = db.batch();
    
    // Add feedback deletions to batch
    feedbackQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add interview deletion to batch
    batch.delete(db.collection('interviews').doc(interviewId));

    // Execute all deletions
    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("Error in deleteInterview:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export async function getUserStats(userId: string) {
  try {
    // Get interviews created by user
    const createdInterviewsSnapshot = await db
      .collection('interviews')
      .where('userId', '==', userId)
      .get();

    // Get interviews taken by user (feedback exists for user)
    const feedbackSnapshot = await db
      .collection('feedback')
      .where('userId', '==', userId)
      .get();

    // Get all interviews (to find ones user has taken)
    const allInterviewsSnapshot = await db
      .collection('interviews')
      .get();

    const createdInterviews = createdInterviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Interview[];
    const feedbacks = feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
    const allInterviews = allInterviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Interview[];

    // Find interviews taken by user (has feedback)
    const takenInterviewIds = feedbacks.map(feedback => feedback.interviewId);
    const takenInterviews = allInterviews.filter(interview => takenInterviewIds.includes(interview.id));

    // Calculate statistics
    const totalCreatedInterviews = createdInterviews.length;
    const totalTakenInterviews = takenInterviews.length;
    const totalInterviews = totalTakenInterviews; // For completion rate, we care about interviews taken, not created
    const completedInterviews = feedbacks.length; // Same as takenInterviews since feedback = completed
    
    const averageScore = feedbacks.length > 0 
      ? Math.round(feedbacks.reduce((sum, feedback) => sum + feedback.totalScore, 0) / feedbacks.length)
      : 0;

    // Get best score
    const bestScore = feedbacks.length > 0 
      ? Math.max(...feedbacks.map(feedback => feedback.totalScore))
      : 0;

    // Count interview types for taken interviews
    const interviewTypes = takenInterviews.reduce((acc, interview) => {
      acc[interview.type] = (acc[interview.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 30 days) - interviews taken
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentInterviews = takenInterviews.filter(interview => 
      new Date(interview.createdAt) > thirtyDaysAgo
    ).length;

    return {
      totalInterviews: totalTakenInterviews, // Interviews taken by user
      totalCreatedInterviews, // Interviews created by user (new field)
      completedInterviews, // Always same as totalInterviews since having feedback = completed
      averageScore,
      bestScore,
      interviewTypes,
      recentInterviews,
      improvementAreas: feedbacks.length > 0 
        ? feedbacks[feedbacks.length - 1].areasForImprovement || []
        : [],
      strengths: feedbacks.length > 0 
        ? feedbacks[feedbacks.length - 1].strengths || []
        : []
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return null;
  }
}

export async function updateUserProfile(userId: string, data: { name?: string; email?: string }) {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}