export type ThreatLevel = "Normal" | "Alert" | "High Alert" | "Crisis";

export interface OutbreakSignal {
  id: string;
  disease: string;
  pathogen: string;
  country: string;
  location: string;
  source: string;
  timestamp: string;
  threatLevel: ThreatLevel;
  confidenceScore: number;
  snippet: string;
  verified: boolean;
}

export interface UserProfile {
  name: string;
  role: string;
  institution: string;
  avatarUrl: string;
  surveillanceId: string;
  assignedRegion: string;
}
