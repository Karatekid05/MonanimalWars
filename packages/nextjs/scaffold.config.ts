import { defineChain } from "viem";
import * as chains from "viem/chains";
import * as wagmiChains from "wagmi/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  walletAutoConnect: boolean;
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
  onlyLocalBurnerWallet: true,

  // Set this to false to disable the wallet auto-connect
  // More info: https://wagmi.sh/react/hooks/useAutoConnect
  walletAutoConnect: true,
} as const satisfies ScaffoldConfig;

export const contracts = {
  20143: {  // Monad Devnet
    MonanimalWars: {
      address: "0xc1e0a9db9ea830c52603798481045688c8ae99c2",
      abi: [/* ... existing ABI ... */],
    },
    NadNameService: {
      address: "0x3019BF1dfB84E5b46Ca9D0eEC37dE08a59A41308",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "addr",
              type: "address",
            },
          ],
          name: "getPrimaryNameForAddress",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "node",
              type: "bytes32",
            },
          ],
          name: "getResolvedAddress",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        }
      ],
    },
  },
} as const;

export default scaffoldConfig;
