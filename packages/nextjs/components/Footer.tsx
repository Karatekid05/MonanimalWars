import React from "react";
import Image from "next/image";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      {/* Essential Features */}
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div>
                <div className="btn btn-primary btn-sm font-normal gap-1 cursor-auto">
                  <span>${nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link href="/blockexplorer" passHref className="btn btn-primary btn-sm font-normal gap-1">
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Centralized Content */}
      <div className="flex flex-col justify-center items-center w-full text-center mt-10">
        <p className="text-lg font-medium">
          Built by{" "}
          <a href="https://x.com/monadicoo" target="_blank" rel="noreferrer" className="link">
            Ravel
          </a>
          ,{" "}
          <a href="https://x.com/dgrua50" target="_blank" rel="noreferrer" className="link">
            KarateKid
          </a>
          , and{" "}
          <a href="https://x.com/MarKript0" target="_blank" rel="noreferrer" className="link">
            MarKrypto
          </a>
        </p>
        <div className="mt-4">
          <Image src="/images/MonadLogo.png" alt="Monad Logo" width={48} height={48} className="w-12 h-12" />
        </div>
      </div>
    </div>
  );
};
