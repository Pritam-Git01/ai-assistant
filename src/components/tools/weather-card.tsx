"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  MapPin,
  AlertCircle,
} from "lucide-react";

interface WeatherData {
  error: boolean;
  message?: string;
  location?: string;
  country?: string;
  temperature?: number;
  feelsLike?: number;
  tempMin?: number;
  tempMax?: number;
  humidity?: number;
  description?: string;
  icon?: string;
  windSpeed?: number;
  pressure?: number;
}

export function WeatherCard({ data }: { data: WeatherData }) {
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

  const weatherIconUrl = data.icon
    ? `https://openweathermap.org/img/wn/${data.icon}@2x.png`
    : null;

  return (
    <Card className="w-full max-w-sm overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">
              {data.location}
              {data.country && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {data.country}
                </span>
              )}
            </CardTitle>
          </div>
          {weatherIconUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={weatherIconUrl} alt={data.description || ""} className="h-12 w-12" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-blue-700 dark:text-blue-300">
            {data.temperature}°C
          </span>
          <span className="mb-1 text-sm capitalize text-muted-foreground">
            {data.description}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Feels Like</p>
              <p className="font-medium">{data.feelsLike}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
            <Droplets className="h-4 w-4 text-cyan-500" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="font-medium">{data.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
            <Wind className="h-4 w-4 text-teal-500" />
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="font-medium">{data.windSpeed} m/s</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
            <Cloud className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-muted-foreground">H / L</p>
              <p className="font-medium">
                {data.tempMax}° / {data.tempMin}°
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
