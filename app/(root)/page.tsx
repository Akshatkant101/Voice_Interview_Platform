import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Page = async () => {
  const user = await getCurrentUser();

  // Independent queries — run them together rather than waterfalling.
  const [userInterviews, availableInterviews] = await Promise.all([
    getInterviewsByUserId(user?.id),
    getLatestInterviews({ userId: user?.id ?? "" }),
  ]);

  const hasPastInterviews = userInterviews.length > 0;
  const hasAvailableInterviews = availableInterviews.length > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice &amp; Feedback</h2>
          <p className="text-lg">
            Practice on real interview questions &amp; get instant feedback
          </p>
          <Button className="btn-primary max-sm:w-full" asChild>
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="robot-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={interview.userId}
                role={interview.role}
                type={interview.type}
                level={interview.level}
                techstack={interview.techstack}
                coverImage={interview.coverImage}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <EmptyState
              title="You haven't created an interview yet"
              body="Start an interview and the AI will put together a question set tailored to the role you're targeting."
              actionHref="/interview"
              actionLabel="Create your first interview"
            />
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>
        <div className="interviews-section">
          {hasAvailableInterviews ? (
            availableInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={interview.userId}
                role={interview.role}
                type={interview.type}
                level={interview.level}
                techstack={interview.techstack}
                coverImage={interview.coverImage}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <EmptyState
              title="No interviews available yet"
              body="Once interviews are created they'll show up here for you to practice with."
            />
          )}
        </div>
      </section>
    </>
  );
};

const EmptyState = ({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) => (
  <div className="card-border w-full">
    <div className="card flex flex-col items-center gap-3 px-8 py-12 text-center">
      <h3 className="text-xl">{title}</h3>
      <p className="max-w-md text-light-400">{body}</p>
      {actionHref && actionLabel && (
        <Button className="btn-primary mt-2" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  </div>
);

export default Page;
