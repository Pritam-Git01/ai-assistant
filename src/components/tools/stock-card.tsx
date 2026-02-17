"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  AlertCircle,
} from "lucide-react";

interface StockData {
  error: boolean;
  message?: string;
  symbol?: string;
  price?: string;
  change?: string;
  changePercent?: string;
  previousClose?: string;
  open?: string;
  high?: string;
  low?: string;
  volume?: string;
  latestTradingDay?: string;
}

export function StockCard({ data }: { data: StockData }) {
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

  const isPositive = data.change && parseFloat(data.change) >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
  const bgGradient = isPositive
    ? "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30"
    : "from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30";

  return (
    <Card className={`w-full max-w-sm overflow-hidden bg-gradient-to-br ${bgGradient}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            <CardTitle className="text-lg">{data.symbol}</CardTitle>
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isPositive ? "+" : ""}
              {data.changePercent}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold">${data.price}</span>
          <span className={`mb-1 text-sm font-medium ${trendColor}`}>
            {isPositive ? "+" : ""}
            {data.change}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
            <div>
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="font-medium">${data.open}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
            <div>
              <p className="text-xs text-muted-foreground">Previous Close</p>
              <p className="font-medium">${data.previousClose}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
            <div>
              <p className="text-xs text-muted-foreground">Day Range</p>
              <p className="font-medium">
                ${data.low} - ${data.high}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="font-medium">{data.volume}</p>
            </div>
          </div>
        </div>

        {data.latestTradingDay && (
          <p className="text-xs text-muted-foreground">
            Last updated: {data.latestTradingDay}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
