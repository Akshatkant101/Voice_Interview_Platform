import Agents from "@/components/Agents";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const user = await getCurrentUser();

  // The layout already gates on this, but narrowing here keeps `userName`
  // a plain string instead of `string | undefined`.
  if (!user) redirect("/sign-in");

  return (
    <>
      <h3>Interview Generation</h3>
      <Agents userName={user.name} userId={user.id} type="generate" />
    </>
  );
};

export default page;
