import { NextRequest, NextResponse } from "next/server";
import { DashboardSummaryApiResponse } from "@/types/dashboardApi";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const year = searchParams.get("year") || "2026";

    // Read base URL and token from server environment securely
    const rawBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_BASE_URL ||
      "https://abvc-surveillance.org/nlp";
    
    // Ensure clean baseUrl without trailing slash
    const baseUrl = rawBaseUrl.replace(/\/+$/, "");

    // Securely retrieve the Bearer Token without ever exposing it to client
    const apiToken =
      process.env.NEXT_PUBLIC_API_TOKEN ||
      process.env.API_TOKEN ||
      "";

    // Build query URL to Rust Backend
    const targetUrl = new URL(`${baseUrl}/api/v1/dashboard/summary`);
    targetUrl.searchParams.set("year", year);

    // Apply country filter only when specific country is requested
    if (
      country &&
      country !== "All" &&
      country !== "Semua" &&
      country !== "All ASEAN Countries" &&
      country.toLowerCase() !== "all"
    ) {
      targetUrl.searchParams.set("country", country);
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (apiToken) {
      headers["Authorization"] = `Bearer ${apiToken}`;
    }

    const backendResponse = await fetch(targetUrl.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Backend returned HTTP status ${backendResponse.status}`,
          data: null,
        } as DashboardSummaryApiResponse,
        { status: backendResponse.status }
      );
    }

    const data: DashboardSummaryApiResponse = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        message,
        data: null,
      } as DashboardSummaryApiResponse,
      { status: 500 }
    );
  }
}
