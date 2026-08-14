import SignOutButton from "@/components/SignOutButton";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

const Rootlayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="logo" width={38} height={32} />
          <h2 className="text-primary-100">Questly.ai</h2>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-light-100 max-sm:hidden">{user.name}</span>
          <SignOutButton />
        </div>
      </nav>
      {children}
    </div>
  );
};

export default Rootlayout;
