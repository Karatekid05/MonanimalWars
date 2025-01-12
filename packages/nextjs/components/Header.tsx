"use client";

import React from "react";
import Link from "next/link";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

/**
 * Simplified site header with Connect Wallet and Leaderboard button
 */
export const Header = () => {
  return (
    <div className="sticky top-0 navbar bg-base-200 min-h-0 flex-shrink-0 justify-between z-20 border-b-2 border-base-100 px-4 py-4">
      {/* Left side with Leaderboard button */}
      <div className="navbar-start">
        <Link
          href="/leaderboard"
          className="btn btn-primary text-white font-bold px-4 py-2 rounded-md hover:bg-primary-focus"
        >
          Leaderboard
        </Link>
      </div>

      {/* Right side with Connect Wallet */}
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
