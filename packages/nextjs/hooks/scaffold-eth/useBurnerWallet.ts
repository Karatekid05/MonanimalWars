import { useCallback, useEffect, useRef, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { useLocalStorage } from "usehooks-ts";
import { Chain, Hex, HttpTransport, PrivateKeyAccount, createWalletClient, http } from "viem";
import { WalletClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { usePublicClient } from "wagmi";

const burnerStorageKey = "scaffoldEth2.burnerWallet.sk";

/**
 * Checks if the private key is valid
 */
const isValidSk = (pk: Hex | string | undefined | null): boolean => {
  return pk?.length === 64 || pk?.length === 66;
};

/**
 * Save the current burner private key to local storage
 */
export const saveBurnerSK = (privateKey: Hex): void => {
  if (typeof window != "undefined" && window != null) {
    window?.localStorage?.setItem(burnerStorageKey, privateKey);
  }
};

type BurnerAccount = {
  walletClient: WalletClient | undefined;
  account: PrivateKeyAccount | undefined;
  generateNewBurner: () => void;
  saveBurner: () => void;
};

/**
 * Creates a burner wallet
 */
export const useBurnerWallet = (): BurnerAccount => {
  const [burnerSk, setBurnerSk] = useLocalStorage<Hex | null>(burnerStorageKey, null, {
    initializeWithValue: false,
  });

  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork.id });
  const [walletClient, setWalletClient] = useState<WalletClient<HttpTransport, Chain, PrivateKeyAccount>>();
  const [generatedPrivateKey, setGeneratedPrivateKey] = useState<Hex>("0x");
  const [account, setAccount] = useState<PrivateKeyAccount>();
  const isCreatingNewBurnerRef = useRef(false);

  const saveBurner = useCallback(() => {
    if (generatedPrivateKey !== "0x") {
      setBurnerSk(generatedPrivateKey);
    }
  }, [setBurnerSk, generatedPrivateKey]);

  const generateNewBurner = useCallback(() => {
    if (publicClient && !isCreatingNewBurnerRef.current) {
      console.log("🔑 Create new burner wallet...");
      isCreatingNewBurnerRef.current = true;

      const randomPrivateKey = generatePrivateKey();
      const randomAccount = privateKeyToAccount(randomPrivateKey);

      const client = createWalletClient({
        chain: publicClient.chain,
        account: randomAccount,
        transport: http(),
      });

      setWalletClient(client);
      setGeneratedPrivateKey(randomPrivateKey);
      setAccount(randomAccount);

      setBurnerSk(() => {
        console.log("🔥 Saving new burner wallet");
        isCreatingNewBurnerRef.current = false;
        return randomPrivateKey;
      });
      return client;
    } else {
      console.log("⚠ Could not create burner wallet");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient?.chain.id]);

  useEffect(() => {
    if (burnerSk && publicClient?.chain.id) {
      let wallet: WalletClient<HttpTransport, Chain, PrivateKeyAccount> | undefined = undefined;
      if (isValidSk(burnerSk)) {
        const randomAccount = privateKeyToAccount(burnerSk);

        wallet = createWalletClient({
          chain: publicClient.chain,
          account: randomAccount,
          transport: http(),
        });

        setGeneratedPrivateKey(burnerSk);
        setAccount(randomAccount);
      }

      if (wallet) {
        setWalletClient(wallet);
        saveBurner();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burnerSk, publicClient?.chain.id]);

  return {
    walletClient,
    account,
    generateNewBurner,
    saveBurner,
  };
};
