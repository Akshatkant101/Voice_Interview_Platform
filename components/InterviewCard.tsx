import React from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import Link from "next/link";
import DisplayTechIcons from "./DisplayTechIcons";

const InterviewCard = ({
  interviewId,
  role,
  type,
  techstack,
  createdAt,
  coverImage,
  level,
  feedback = null,
}: InterviewCardProps) => {
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now(),
  ).format("MMM D, YYYY");

  // Fall back to a random cover only when the interview has none stored —
  // rolling a new one every render made cards flicker between logos.
  const cover = coverImage || getRandomInterviewCover();

  const hasFeedback = Boolean(feedback);

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
            <p className="badge-text">{normalizedType}</p>
          </div>

          <Image
            src={cover}
            alt={`${role} cover`}
            width={70}
            height={70}
            className="rounded-full object-cover size-[70px]"
          />

          <h3 className="mt-5 capitalize">{role} Interview</h3>
          {level && <p className="text-sm text-light-400 capitalize">{level}</p>}

          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2 items-center">
              <Image
                src="/calendar.svg"
                alt="calendar"
                width={22}
                height={22}
              />
              <p>{formattedDate}</p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" alt="star" width={22} height={22} />
              <p>{feedback?.totalScore ?? "---"}/100</p>
            </div>
          </div>

          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to sharpen your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between items-center gap-4">
          <DisplayTechIcons techStack={techstack} />
          <Link
            href={
              hasFeedback
                ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`
            }
            className="btn-primary flex-center"
          >
            {hasFeedback ? "Check Feedback" : "Take Interview"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
