import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = {
  title: "Monanimal Wars",
  description: "Join the epic battle of Monanimal Wars! Choose your team, attack or heal, and fight for glory on the blockchain.",
  icons: {
    icon: '/images/placa.png',
    shortcut: '/images/placa.png',
    apple: '/images/placa.png',
  },
  openGraph: {
    title: "Monanimal Wars",
    description: "Join the epic battle of Monanimal Wars! Choose your team, attack or heal, and fight for glory on the blockchain.",
    images: [
      {
        url: "/images/placa.png",
        width: 800,
        height: 600,
        alt: "Monanimal Wars",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monanimal Wars",
    description: "Join the epic battle of Monanimal Wars! Choose your team, attack or heal, and fight for glory on the blockchain.",
    images: ["/images/placa.png"],
  },
};

// @ts-ignore
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
