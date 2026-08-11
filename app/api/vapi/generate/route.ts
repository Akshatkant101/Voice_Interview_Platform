import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET() {
  return Response.json({ success: true, data: "Thank you" }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    // Parse the request body safely
    const body = await request.json();
    const { type, role, level, techstack, amount, userid } = body;

    console.log("userid: ", userid);
    console.log("role: ", role);
    console.log("type: ", type);
    console.log("level: ", level);
    console.log("techstack: ", techstack);
    console.log("amount: ", amount);

    // Generate questions using AI
    const { text: questionsText } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions, as a valid JSON array like this:
["Question 1", "Question 2", "Question 3"]
Do not include any extra text or special characters.
Thank you! <3
`,
    });

    // Safely parse AI output
    let parsedQuestions: string[] = [];
    try {
      parsedQuestions = JSON.parse(questionsText);
      if (!Array.isArray(parsedQuestions)) {
        console.warn("AI output was not an array, falling back to empty array");
        parsedQuestions = [];
      }
    } catch (err) {
      console.error("Failed to parse AI questions:", questionsText);
      parsedQuestions = [];
    }

    // Prepare interview object
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((t: string) => t.trim()),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: error.message || error }, { status: 500 });
  }
}
