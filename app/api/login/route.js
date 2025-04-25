import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST(req) {
  try {
    const { password } = await req.json();
    const validPassword = decodeURIComponent(process.env.APP_PASSWORD.trim());

    //console.log("Loaded password from env:", process.env.APP_PASSWORD);

    if (!password || !validPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    // Decode environment variable to support special characters
    const formattedPassword = decodeURIComponent(validPassword.trim());

    if (password === formattedPassword) {
      const cookie = serialize("auth", "true", {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });

      return NextResponse.json(
        { success: true },
        { status: 200, headers: { "Set-Cookie": cookie } }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Incorrect password" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
