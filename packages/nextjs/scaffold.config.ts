import { defineChain } from "viem";
import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

export const monadDevnet = defineChain({
  id: 20143,
  name: "Monad Devnet",
  nativeCurrency: { name: "Monad", symbol: "DMON", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a"],
    },
    public: {
      http: ["https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Devnet Blockscout",
      url: "https://explorer.monad-devnet.devnet101.com",
    },
  },
});

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [monadDevnet], // Add monadDevnet to the list if you are targeting the monad devnet

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "62afc991519fa07f009e934262bd06d4",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: false,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
