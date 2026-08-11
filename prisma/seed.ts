/**
 * Seeds a demo profile plus a handful of interviews so the dashboard has
 * something to render before any Vapi call has ever succeeded.
 *
 * Run with: npm run db:seed
 */
import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

loadEnv({ path: ".env.local" });
loadEnv();

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Set DIRECT_URL (or DATABASE_URL) in .env.local before seeding.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// A stable id so re-running the seed updates rather than duplicates.
const DEMO_USER_ID = "seed-demo-user";

const covers = [
  "/covers/amazon.png",
  "/covers/facebook.png",
  "/covers/spotify.png",
  "/covers/reddit.png",
  "/covers/adobe.png",
  "/covers/pinterest.png",
];

const interviews = [
  {
    id: "seed-frontend-junior",
    role: "Frontend Developer",
    level: "Junior",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    questions: [
      "What is the virtual DOM and why does React use it?",
      "Explain the difference between props and state.",
      "How would you optimise a React component that re-renders too often?",
      "What are React hooks, and what problem do they solve?",
      "How does CSS specificity work?",
    ],
  },
  {
    id: "seed-fullstack-senior",
    role: "Full Stack Developer",
    level: "Senior",
    type: "Mixed",
    techstack: ["Node.js", "Express", "PostgreSQL", "React"],
    questions: [
      "Walk me through how you would design a rate limiter for an API.",
      "How do you decide between SQL and NoSQL for a new service?",
      "Describe a time you had to debug a production outage.",
      "What is database connection pooling and why does it matter in serverless?",
      "How do you approach code review with a junior engineer?",
    ],
  },
  {
    id: "seed-backend-mid",
    role: "Backend Engineer",
    level: "Mid-level",
    type: "Technical",
    techstack: ["Node.js", "PostgreSQL", "Docker", "Redis"],
    questions: [
      "What is the N+1 query problem and how do you fix it?",
      "Explain database indexing and when an index can hurt performance.",
      "How would you design an idempotent payment endpoint?",
      "What is the difference between a queue and a pub/sub system?",
    ],
  },
  {
    id: "seed-devops-mid",
    role: "DevOps Engineer",
    level: "Mid-level",
    type: "Technical",
    techstack: ["Docker", "Kubernetes", "AWS", "Git"],
    questions: [
      "Explain the difference between a container and a virtual machine.",
      "How would you set up zero-downtime deployments?",
      "What does a readiness probe do in Kubernetes?",
      "How do you manage secrets in a CI/CD pipeline?",
    ],
  },
  {
    id: "seed-behavioural-junior",
    role: "Product Engineer",
    level: "Junior",
    type: "Behavioural",
    techstack: ["React", "TypeScript", "Figma"],
    questions: [
      "Tell me about a project you are proud of.",
      "Describe a disagreement with a teammate and how you resolved it.",
      "How do you prioritise when everything feels urgent?",
      "What do you do when you are stuck on a problem?",
    ],
  },
];

async function main() {
  const profile = await prisma.profile.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      name: "Questly Demo",
      email: "demo@questly.ai",
    },
  });

  console.log(`Profile ready: ${profile.name} (${profile.id})`);

  for (const [index, interview] of interviews.entries()) {
    const data = {
      userId: DEMO_USER_ID,
      role: interview.role,
      level: interview.level,
      type: interview.type,
      techstack: interview.techstack,
      questions: interview.questions,
      finalized: true,
      coverImage: covers[index % covers.length],
    };

    await prisma.interview.upsert({
      where: { id: interview.id },
      update: data,
      create: { id: interview.id, ...data },
    });

    console.log(`  seeded: ${interview.role} (${interview.level})`);
  }

  const total = await prisma.interview.count();
  console.log(`\nDone. ${total} interview(s) in the database.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
