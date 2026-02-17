"use client";

import { WeatherCard } from "@/components/tools/weather-card";
import { F1Card } from "@/components/tools/f1-card";
import { StockCard } from "@/components/tools/stock-card";
import { Loader2 } from "lucide-react";

interface ToolInvocationProps {
  toolName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any;
  state: string;
}

export function ToolResult({ toolName, args, result, state }: ToolInvocationProps) {
  // Show loading state while tool is executing
  if (state === "call" || state === "partial-call") {
    return (
      <div className="my-2 flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {toolName === "getWeather" && `Fetching weather for ${args.location}...`}
          {toolName === "getF1Matches" && "Fetching F1 race data..."}
          {toolName === "getStockPrice" && `Fetching stock price for ${args.symbol}...`}
        </span>
      </div>
    );
  }

  // Show the result card once the tool has completed
  if (state === "result" && result) {
    switch (toolName) {
      case "getWeather":
        return (
          <div className="my-2">
            <WeatherCard data={result} />
          </div>
        );
      case "getF1Matches":
        return (
          <div className="my-2">
            <F1Card data={result} />
          </div>
        );
      case "getStockPrice":
        return (
          <div className="my-2">
            <StockCard data={result} />
          </div>
        );
      default:
        return (
          <div className="my-2 rounded-lg border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              Tool: {toolName}
            </p>
            <pre className="mt-1 text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        );
    }
  }

  return null;
}
