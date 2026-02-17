"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag, Calendar, MapPin, Trophy, AlertCircle } from "lucide-react";

interface F1Data {
  error: boolean;
  message?: string;
  season?: number;
  totalRaces?: number;
  isUpcoming?: boolean;
  nextRace?: {
    name: string;
    circuit: string;
    location: string;
    country: string;
    date: string;
    time: string;
    round: string;
  };
  upcomingCount?: number;
}

export function F1Card({ data }: { data: F1Data }) {
  if (data.error) {
    return (
      <Card className="w-full max-w-sm border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{data.message}</p>
        </CardContent>
      </Card>
    );
  }

  const race = data.nextRace;
  if (!race) return null;

  const raceDate = new Date(`${race.date}T${race.time !== "TBD" ? race.time : "00:00:00Z"}`);
  const formattedDate = raceDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime =
    race.time !== "TBD"
      ? raceDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      : "TBD";

  return (
    <Card className="w-full max-w-sm overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-red-600 dark:text-red-400" />
            <CardTitle className="text-lg">
              {data.isUpcoming ? "Next Race" : "Last Race"}
            </CardTitle>
          </div>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
            Round {race.round} / {data.totalRaces}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <h3 className="text-xl font-bold text-red-700 dark:text-red-300">
          {race.name}
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-xs text-muted-foreground">Circuit</p>
              <p className="font-medium">{race.circuit}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
            <MapPin className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">
                {race.location}, {race.country}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
            <Calendar className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Date & Time</p>
              <p className="font-medium">{formattedDate}</p>
              <p className="text-xs text-muted-foreground">{formattedTime}</p>
            </div>
          </div>
        </div>

        {data.upcomingCount !== undefined && data.upcomingCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {data.upcomingCount} races remaining in the {data.season} season
          </p>
        )}
      </CardContent>
    </Card>
  );
}
