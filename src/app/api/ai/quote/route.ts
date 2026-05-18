import { NextResponse } from "next/server";
import { getDailyQuote } from "@/lib/ai";

export async function GET() {
  try {
    const quote = getDailyQuote();
    return NextResponse.json({ success: true, data: { quote } });
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
