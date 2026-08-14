"use server";

import { prisma } from "@/lib/prisma";

// Prisma returns Date objects and a Json column; the UI types expect plain
// strings, so normalise at the boundary rather than in every component.
const toInterview = (row: {
  id: string;
  userId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  questions: string[];
  finalized: boolean;
  coverImage: string | null;
  createdAt: Date;
}): Interview => ({
  id: row.id,
  userId: row.userId,
  role: row.role,
  level: row.level,
  type: row.type,
  techstack: row.techstack,
  questions: row.questions,
  finalized: row.finalized,
  coverImage: row.coverImage ?? undefined,
  createdAt: row.createdAt.toISOString(),
});

/** Interviews this user created, newest first. */
export async function getInterviewsByUserId(
  userId?: string,
): Promise<Interview[]> {
  if (!userId) return [];

  const rows = await prisma.interview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toInterview);
}

/** Finalized interviews created by *other* people, for the "Take an Interview" rail. */
export async function getLatestInterviews({
  userId,
  limit = 20,
}: GetLatestInterviewsParams): Promise<Interview[]> {
  const rows = await prisma.interview.findMany({
    where: {
      finalized: true,
      ...(userId ? { userId: { not: userId } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map(toInterview);
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const row = await prisma.interview.findUnique({ where: { id } });
  return row ? toInterview(row) : null;
}

export async function getFeedbackByInterviewId({
  interviewId,
  userId,
}: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  const row = await prisma.feedback.findUnique({
    where: { interviewId_userId: { interviewId, userId } },
  });

  if (!row) return null;

  return {
    id: row.id,
    interviewId: row.interviewId,
    totalScore: row.totalScore,
    categoryScores: row.categoryScores as Feedback["categoryScores"],
    strengths: row.strengths,
    areasForImprovement: row.areasForImprovement,
    finalAssessment: row.finalAssessment,
    createdAt: row.createdAt.toISOString(),
  };
}
