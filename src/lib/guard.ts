import { NextResponse } from "next/server";

/** Wraps a route handler so auth/authorization failures return proper JSON status codes
 *  instead of an unhandled 500, and unexpected errors never leak internals. */
export function guard<A extends unknown[]>(fn: (...args: A) => Promise<NextResponse>) {
  return async (...args: A): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      if (message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      if (message === "FORBIDDEN" || message === "SUSPENDED") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      console.error("API error:", message);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}
