"use server";

// Firebase still owns authentication (credentials + session cookies).
// Profile rows live in Supabase Postgres, keyed by the Firebase uid.
import { auth } from "@/firebase/admin";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const existing = await prisma.profile.findUnique({ where: { id: uid } });

    if (existing) {
      return {
        success: false,
        message: "User already exists. Please sign in instead.",
      };
    }

    await prisma.profile.create({ data: { id: uid, name, email } });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (err: any) {
    console.log("Error creating user", err);

    if (err.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use.",
      };
    }

    return {
      success: false,
      message: "Failed to create account",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. Create an account instead.",
      };
    }

    // A Firebase account can exist without a profile row (e.g. signed up
    // before the Supabase migration). Backfill instead of dead-ending them.
    await prisma.profile.upsert({
      where: { id: userRecord.uid },
      update: {},
      create: {
        id: userRecord.uid,
        name: userRecord.displayName ?? email.split("@")[0],
        email,
      },
    });

    await setSessionCookie(idToken);

    // The caller checks `result?.success`; returning nothing on the happy
    // path made a successful sign-in indistinguishable from a failure.
    return { success: true, message: "Signed in successfully." };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Failed to log into an account",
    };
  }
}

export async function setSessionCookie(idtoken: string) {
  const cookieStore = await cookies();
  const sessionCookie = await auth.createSessionCookie(idtoken, {
    expiresIn: ONE_WEEK * 1000,
  });
  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const profile = await prisma.profile.findUnique({
      where: { id: decodedClaims.uid },
    });

    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
    };
  } catch (e) {
    console.log(e);

    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user;
}
