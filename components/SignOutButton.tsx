"use client";

import { signOut } from "@/lib/actions/auth.action";
import { auth } from "@/firebase/Client";
import { signOut as firebaseSignOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const SignOutButton = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);
    try {
      // Clear both halves: the Firebase client session and the httpOnly
      // cookie the server layouts actually gate on.
      await firebaseSignOut(auth);
      await signOut();
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Could not sign out. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="btn-secondary disabled:opacity-60"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
};

export default SignOutButton;
