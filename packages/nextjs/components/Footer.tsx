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
    <div className="min-h-0 py-3 px-1 mb-11 lg:mb-0 bg-gradient-to-r from-[#2A2A2A] to-[#1A1A1A] border-t border-[#FECA7E]/20">
      {/* Essential Features */}
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div>
                <div className="btn border-2 border-[#FECA7E] bg-transparent text-[#FECA7E] hover:bg-[#FECA7E] hover:text-black font-bold transition-all duration-200">
                  <span>${nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link href="/blockexplorer" passHref className="btn border-2 border-[#FECA7E] bg-transparent text-[#FECA7E] hover:bg-[#FECA7E] hover:text-black font-bold transition-all duration-200">
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Centralized Content */}
      <div className="flex flex-col justify-center items-center w-full text-center mt-4">
        <p className="text-lg font-medium text-[#FECA7E]">
          Built by{" "}
          <a href="https://x.com/monadicoo" target="_blank" rel="noreferrer" className="hover:text-[#FED99E] transition-colors">
            Ravel
          </a>
          ,{" "}
          <a href="https://x.com/dgrua50" target="_blank" rel="noreferrer" className="hover:text-[#FED99E] transition-colors">
            KarateKid
          </a>
          , and{" "}
          <a href="https://x.com/MarKript0" target="_blank" rel="noreferrer" className="hover:text-[#FED99E] transition-colors">
            MarKrypto
          </a>
        </p>
        <div className="mt-2">
          <Image
            src="/images/Escudo1.png"
            alt="Monad Logo"
            width={150}
            height={150}
            className="w-32 h-32 opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </div>
  );
};
