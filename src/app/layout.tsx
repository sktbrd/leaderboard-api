// file: src/app/layout.tsx (Server Component by default)
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { getServerConfig } from "./utils/wagmiConfig.server"; // <--- Import server safe config
import "./globals.css";
import { Provider } from "./utils/wagmiProvider";

export const metadata: Metadata = {
  title: "Skatehive API",
  description: "API for Skatehive leaderboard",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const config = getServerConfig();
  const cookieHeader = (await headers()).get("cookie") || "";
  const initialState = cookieToInitialState(config, cookieHeader);

  return (
    <html lang="en">
      <body>
        {/* 
          Note: We'll now pass initialState to a Client Provider 
          that you import from a *client* file.
        */}
        <Provider initialState={initialState}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
