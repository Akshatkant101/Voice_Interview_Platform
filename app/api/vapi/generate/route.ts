import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { getRandomInterviewCover } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

// Asking for "a JSON array" in prose and then hand-parsing it fails whenever
// the model wraps the reply in a ```json fence or adds a stray sentence — and
// the old catch turned that into a silently saved interview with 0 questions.
// A schema makes the SDK enforce the shape instead.
// gemini-2.0-flash-001 was retired, and the whole 2.5 family is closed to new
// API keys ("no longer available to new users"), so this key can only use 3.x.
// Override with GEMINI_MODEL in .env.local (gemini-3.6-flash also works).
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

const questionsSchema = z.object({
  questions: z
    .array(z.string().min(1))
    .describe("The interview questions, one per array entry."),
});

export async function GET() {
  return Response.json({ success: true, data: "Thank you" }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, role, level, techstack, amount, userid } = body;

    console.log("vapi/generate payload:", {
      userid,
      role,
      type,
      level,
      techstack,
      amount,
    });

    if (!userid) {
      return Response.json(
        { success: false, error: "Missing userid" },
        { status: 400 },
      );
    }

    // The interview is owned by a profile row; without one the insert would
    // fail on the foreign key with a much less obvious error.
    const profile = await prisma.profile.findUnique({ where: { id: userid } });

    if (!profile) {
      return Response.json(
        { success: false, error: `No profile found for userid ${userid}` },
        { status: 404 },
      );
    }

    // Vapi sends everything as strings; clamp so a mis-heard "fifty" can't
    // ask the model for an absurd number of questions.
    const questionCount = Math.min(Math.max(Number(amount) || 5, 1), 20);

    const { object } = await generateObject({
      model: google(MODEL),
      schema: questionsSchema,
      prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
Return exactly ${questionCount} questions.
The questions are going to be read aloud by a voice assistant, so do not use
"/", "*", or any other special characters that would break speech synthesis.`,
    });

    const parsedQuestions = object.questions
      .map((q) => q.trim())
      .filter(Boolean);

    // Better to fail loudly than to store an interview nobody can take.
    if (parsedQuestions.length === 0) {
      console.error("Model returned no usable questions");
      return Response.json(
        { success: false, error: "Failed to generate questions" },
        { status: 422 },
      );
    }

    const interview = await prisma.interview.create({
      data: {
        userId: userid,
        role,
        level,
        type,
        techstack: String(techstack)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        questions: parsedQuestions,
        finalized: true,
        coverImage: getRandomInterviewCover(),
      },
    });

    return Response.json(
      { success: true, interviewId: interview.id },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
