import {
  DashboardSummaryApiResponse,
  DashboardSummaryData,
} from "@/types/dashboardApi";

export async function fetchDashboardSummary(
  country?: string,
  year?: string
): Promise<DashboardSummaryData | null> {
  try {
    const params = new URLSearchParams();
    if (year) {
      params.set("year", year);
    }
    if (
      country &&
      country !== "All" &&
      country !== "Semua" &&
      country !== "All ASEAN Countries" &&
      country.toLowerCase() !== "all"
    ) {
      params.set("country", country);
    }

    const queryString = params.toString();
    const url = `/mobile/api/dashboard/summary${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[dashboardService] Failed to fetch dashboard summary: HTTP ${res.status}`);
      return null;
    }

    const result: DashboardSummaryApiResponse = await res.json();
    if (result.success && result.data) {
      return result.data;
    }

    return null;
  } catch (err) {
    console.error("[dashboardService] Error fetching dashboard summary:", err);
    return null;
  }
}
