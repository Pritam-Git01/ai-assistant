import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { auth } from "@/lib/auth";
import { tools } from "@/lib/tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  // Protect the endpoint - only authenticated users can use the chat
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: `You are a helpful AI assistant with access to real-world tools. You can:
1. **Get Weather**: Fetch current weather data for any city worldwide. When asked about weather, always use the getWeather tool.
2. **Get F1 Matches**: Fetch the next upcoming Formula 1 race and current season info. When asked about F1, Formula 1, or racing, use the getF1Matches tool.
3. **Get Stock Prices**: Fetch real-time stock prices for any publicly traded company. When asked about stocks, share prices, or market data, use the getStockPrice tool.

Always use the appropriate tool when the user's question relates to weather, F1, or stocks. After getting tool results, provide a clear and friendly summary of the information. If a tool returns an error, explain the issue helpfully.

For general questions not related to these tools, respond naturally and helpfully.`,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(3), // Replace maxSteps with stopWhen
  });

  return result.toUIMessageStreamResponse(); // Replace toDataStreamResponse with toUIMessageStreamResponse
}