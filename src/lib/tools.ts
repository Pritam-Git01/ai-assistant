import { tool } from "ai";
import { z } from "zod";

// ============================================
// Weather Tool - OpenWeatherMap API
// ============================================

export const getWeather = tool({
  description:
    "Get the current weather for a given location. Use this when a user asks about weather conditions, temperature, humidity, etc.",
  inputSchema: z.object({
    location: z
      .string()
      .describe("The city name to get weather for, e.g. 'London', 'New York', 'Tokyo'"),
  }),
  execute: async ({ location }) => {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      return {
        error: true,
        message: "Weather API key is not configured.",
      };
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        location
      )}&appid=${apiKey}&units=metric`;

      const response = await fetch(url);
      if (!response.ok) {
        return {
          error: true,
          message: `Could not fetch weather data for "${location}". Please check the location name.`,
        };
      }

      const data = await response.json();

      return {
        error: false,
        location: data.name,
        country: data.sys?.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        tempMin: Math.round(data.main.temp_min),
        tempMax: Math.round(data.main.temp_max),
        humidity: data.main.humidity,
        description: data.weather?.[0]?.description,
        icon: data.weather?.[0]?.icon,
        windSpeed: data.wind?.speed,
        pressure: data.main?.pressure,
      };
    } catch {
      return {
        error: true,
        message: "Failed to connect to weather service.",
      };
    }
  },
});

// ============================================
// F1 Matches Tool - Ergast API
// ============================================

export const getF1Matches = tool({
  description:
    "Get information about the next upcoming Formula 1 race or the current F1 season schedule. Use this when a user asks about F1 races, Grand Prix, or Formula 1.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      // Get current season schedule
      const currentYear = new Date().getFullYear();
      const url = `https://api.jolpi.ca/ergast/f1/${currentYear}.json`;

      const response = await fetch(url);
      if (!response.ok) {
        return {
          error: true,
          message: "Could not fetch F1 race data.",
        };
      }

      const data = await response.json();
      const races = data?.MRData?.RaceTable?.Races;

      if (!races || races.length === 0) {
        return {
          error: true,
          message: "No F1 races found for the current season.",
        };
      }

      // Find the next upcoming race
      const now = new Date();
      const upcomingRaces = races.filter((race: { date: string; time?: string }) => {
        const raceDate = new Date(`${race.date}T${race.time || "00:00:00Z"}`);
        return raceDate > now;
      });

      const nextRace = upcomingRaces.length > 0 ? upcomingRaces[0] : races[races.length - 1];
      const isUpcoming = upcomingRaces.length > 0;

      return {
        error: false,
        season: currentYear,
        totalRaces: races.length,
        isUpcoming,
        nextRace: {
          name: nextRace.raceName,
          circuit: nextRace.Circuit?.circuitName,
          location: nextRace.Circuit?.Location?.locality,
          country: nextRace.Circuit?.Location?.country,
          date: nextRace.date,
          time: nextRace.time || "TBD",
          round: nextRace.round,
        },
        upcomingCount: upcomingRaces.length,
      };
    } catch {
      return {
        error: true,
        message: "Failed to connect to F1 data service.",
      };
    }
  },
});

// ============================================
// Stock Price Tool - Alpha Vantage API
// ============================================

export const getStockPrice = tool({
  description:
    "Get the current stock price for a given stock symbol/ticker. Use this when a user asks about stock prices, market data, or share prices.",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe("The stock ticker symbol, e.g. 'AAPL', 'GOOGL', 'MSFT', 'TSLA'"),
  }),
  execute: async ({ symbol }) => {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return {
        error: true,
        message: "Stock API key is not configured.",
      };
    }

    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
        symbol.toUpperCase()
      )}&apikey=${apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        return {
          error: true,
          message: `Could not fetch stock data for "${symbol}".`,
        };
      }

      const data = await response.json();
      const quote = data["Global Quote"];

      if (!quote || Object.keys(quote).length === 0) {
        return {
          error: true,
          message: `No stock data found for symbol "${symbol}". Please check the ticker symbol.`,
        };
      }

      const price = parseFloat(quote["05. price"]);
      const change = parseFloat(quote["09. change"]);
      const changePercent = quote["10. change percent"];
      const previousClose = parseFloat(quote["08. previous close"]);
      const open = parseFloat(quote["02. open"]);
      const high = parseFloat(quote["03. high"]);
      const low = parseFloat(quote["04. low"]);
      const volume = parseInt(quote["06. volume"], 10);

      return {
        error: false,
        symbol: quote["01. symbol"],
        price: price.toFixed(2),
        change: change.toFixed(2),
        changePercent,
        previousClose: previousClose.toFixed(2),
        open: open.toFixed(2),
        high: high.toFixed(2),
        low: low.toFixed(2),
        volume: volume.toLocaleString(),
        latestTradingDay: quote["07. latest trading day"],
      };
    } catch {
      return {
        error: true,
        message: "Failed to connect to stock data service.",
      };
    }
  },
});

export const tools = {
  getWeather,
  getF1Matches,
  getStockPrice,
};