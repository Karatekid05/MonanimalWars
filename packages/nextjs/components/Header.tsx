"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export const Header = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedMonanimal, setSelectedMonanimal] = useState<{
    name: string;
    image: string;
  } | null>(null);

  const [showKingPopup, setShowKingPopup] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [monanimalRevealed, setMonanimalRevealed] = useState<{
    name: string;
    image: string;
  } | null>(null);

  const monanimals = [
    { name: "Moyaki", image: "/images/Moyaki.png" },
    { name: "Mopo", image: "/images/mopo.png" },
    { name: "Chog", image: "/images/Chog1.png" },
    { name: "Salmonad", image: "/images/Salmonad1.png" },
    { name: "Mouch", image: "/images/mosca.png" },
  ];

  const selectRandomMonanimal = () => {
    if (!selectedMonanimal) {
      setShowKingPopup(true);
      setAnimationStarted(false);
      setMonanimalRevealed(null);
    }
  };

  const revealMonanimal = () => {
    setAnimationStarted(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * monanimals.length);
      setMonanimalRevealed(monanimals[randomIndex]);
      setAnimationStarted(false);
    }, 3000);
  };

  const finalizeSelection = () => {
    if (monanimalRevealed) {
      setSelectedMonanimal(monanimalRevealed);
    }
    setShowKingPopup(false);
  };

  const closeLeaderboard = () => setShowLeaderboard(false);

  const demoLeaderboardData = [
    { username: "Player1", attack: 30, heal: 10, totalPoints: 200 },
    { username: "Player2", attack: 25, heal: 15, totalPoints: 180 },
    { username: "Player3", attack: 20, heal: 20, totalPoints: 160 },
    { username: "Player4", attack: 15, heal: 25, totalPoints: 140 },
    { username: "Player5", attack: 10, heal: 30, totalPoints: 120 },
  ];

  return (
    <div className="sticky top-0 navbar bg-base-200 min-h-0 flex-shrink-0 justify-between z-20 border-b-2 border-base-100 px-4 py-4">
      <div className="navbar-start">
        <Link
          href="/team"
          className="btn btn-secondary text-white font-bold px-4 py-2 rounded-md hover:bg-secondary-focus"
        >
          Meet the Team
        </Link>
      </div>

      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        <button
          onClick={() => setShowLeaderboard(true)}
          className="btn btn-primary text-white font-bold px-4 py-2 rounded-md hover:bg-primary-focus ml-4"
        >
          Show Leaderboard
        </button>
        <button
          onClick={selectRandomMonanimal}
          disabled={!!selectedMonanimal}
          className={`btn ${
            selectedMonanimal ? "bg-purple-500 cursor-not-allowed" : "btn-accent"
          } text-white font-bold px-4 py-2 rounded-md hover:bg-accent-focus ml-4`}
        >
          {selectedMonanimal ? `Team: ${selectedMonanimal.name}` : "Select Monanimal"}
        </button>
      </div>

      {showKingPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            {!monanimalRevealed ? (
              <>
                {!animationStarted ? (
                  <>
                    <h2 className="text-xl font-bold mb-4">King Monavara&apos;s Decision</h2>
                    <Image
                      src="/images/Monavara-scooter.png"
                      alt="King Monavara"
                      width={128}
                      height={128}
                      className="mx-auto mb-4"
                    />
                    <p className="text-center text-lg font-bold">
                      Now King Monavara will decide your path on the battlefield.
                    </p>
                    <p className="text-center text-sm">Fight with honor and seek glory!</p>
                    <button
                      onClick={revealMonanimal}
                      className="btn btn-primary mt-4 mx-auto"
                    >
                      Reveal Your Monanimal
                    </button>
                  </>
                ) : (
                  <p className="text-center text-lg font-bold">The decision is being made...</p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Your Monanimal</h2>
                <Image
                  src={monanimalRevealed?.image || ""}
                  alt={monanimalRevealed?.name || ""}
                  width={128}
                  height={128}
                  className="mx-auto mb-4"
                />
                <p className="text-center text-lg font-bold">{monanimalRevealed?.name}</p>
                <button
                  onClick={finalizeSelection}
                  className="btn btn-primary mt-4 mx-auto"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 w-3/4 max-w-xl shadow-lg relative">
            <button
              onClick={closeLeaderboard}
              className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white font-bold rounded hover:bg-red-600"
            >
              Close
            </button>
            <h2 className="text-xl font-bold text-center mb-6">Leaderboard</h2>
            <table className="table-auto w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">Username</th>
                  <th className="border border-gray-300 px-4 py-2">Attack</th>
                  <th className="border border-gray-300 px-4 py-2">Heal</th>
                  <th className="border border-gray-300 px-4 py-2">Total Points</th>
                </tr>
              </thead>
              <tbody>
                {demoLeaderboardData.map((user, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.attack}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.heal}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
