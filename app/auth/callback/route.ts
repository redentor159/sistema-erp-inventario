import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // The `/auth/callback` route is required for the server-side auth flow implemented
    // by the SSR package. It exchanges an auth code for the user's session.
    // https://supabase.com/docs/guides/auth/server-side/nextjs

    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/"; // Default redirect
    const type = requestUrl.searchParams.get("type");
    const error_description = requestUrl.searchParams.get("error_description");

    if (error_description) {
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(error_description)}`, request.url)
        );
    }

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Si el type fue 'recovery', re-enrutar explícitamente a reset-password independientemente de `next`
            if (type === "recovery") {
                return NextResponse.redirect(new URL("/reset-password", request.url));
            }
            return NextResponse.redirect(new URL(next, request.url));
        } else {
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
            );
        }
    }

    // Return the user to an error page if there are no params or the code processing failed mysteriously
    return NextResponse.redirect(new URL("/login?error=Invalid_Auth_Link", request.url));
}
