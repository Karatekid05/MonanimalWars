"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAccount, useConnect } from 'wagmi';
import { injected } from '@wagmi/connectors'; // Correct import for injected connector

const Home = () => {
  // State for Monanimals
  const initialHealth = 100;
  const [healths, setHealths] = useState<number[]>(Array(5).fill(initialHealth));

  // State for leaderboard modal
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Leaderboard data
  const leaderboard = [
    { name: "User1", score: 120 },
    { name: "User2", score: 110 },
    { name: "User3", score: 105 },
    { name: "User4", score: 95 },
    { name: "User5", score: 90 },
    { name: "User6", score: 85 },
    { name: "User7", score: 80 },
    { name: "User8", score: 75 },
    { name: "User9", score: 70 },
    { name: "User10", score: 65 },
  ];

  // Get account information and connect function
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  const handleAttack = (index: number) => {
    if (isConnected) {
      setHealths((prev) =>
        prev.map((health, i) => (i === index ? Math.max(health - 10, 0) : health))
      );
    } else {
      connect({ connector: injected() }); // Open wallet connection modal if not connected
    }
  };

  const handleHeal = (index: number) => {
    if (isConnected) {
      setHealths((prev) =>
        prev.map((health, i) => (i === index ? Math.min(health + 10, initialHealth) : health))
      );
    } else {
      connect({ connector: injected() }); // Open wallet connection modal if not connected
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/images/BG_site.png')`,
      }}
    >

      {/* Main Content */}
      <div className="flex flex-col flex-grow pt-10">
        <h2 className="text-center text-3xl font-bold mb-8 text-white">
          Welcome to Monanimal Wars
        </h2>
        <p className="text-center text-lg mb-12 text-white">
          Choose your favorite Monanimal and attack or heal them! Actions are logged on the blockchain.
        </p>

        {/* Grid of Monanimal Cards */}
        <div className="grid grid-cols-5 gap-8 justify-center p-8">
          {[{ name: "Moyaki", image: "/images/Moyaki.png" },
            { name: "Mopo", image: "/images/mopo.png" },
            { name: "Chog", image: "/images/Chog1.png" },
            { name: "Salmonad", image: "/images/Salmonad1.png" },
            { name: "Mouch", image: "/images/mosca.png" },
          ].map((monanimal, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm text-center rounded-3xl shadow-lg flex flex-col h-full"
              style={{
                width: "286px",
                height: "408px",
                backgroundImage: "url('/images/bgg.jpg')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex-1 flex items-center justify-center">
                  <Image
                    src={monanimal.image}
                    alt={monanimal.name}
                    width={120}
                    height={120}
                    className="mx-auto"
                  />
                </div>
                <div className="mt-2 flex flex-col items-center h-20">
                  <h3 className="text-xl font-bold">{monanimal.name}</h3>
                  <p className="text-md my-1">Health: {healths[index]}</p>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-2 h-16">
                <button
                  onClick={() => handleAttack(index)}
                  disabled={!isConnected} // Disable if not connected
                  className={`px-2 py-1 ${isConnected ? 'bg-red-500' : 'bg-gray-400'} text-white font-bold rounded hover:bg-red-600 text-sm`}
                >
                  Attack
                </button>
                <button
                  onClick={() => handleHeal(index)}
                  disabled={!isConnected} // Disable if not connected
                  className={`px-1 py-2 ${isConnected ? 'bg-green-500' : 'bg-gray-400'} text-white font-bold rounded hover:bg-green-600 text-sm`}
                >
                  Heal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 w-3/4 max-w-2xl shadow-lg relative">
            <button
              onClick={() => setShowLeaderboard(false)}
              className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white font-bold rounded hover:bg-red-600"
            >
              Close
            </button>
            <h2 className="text-2xl font-bold text-center mb-6">Leaderboard</h2>
            <table className="table-auto w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">Rank</th>
                  <th className="border border-gray-300 px-4 py-2">User</th>
                  <th className="border border-gray-300 px-4 py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.score}</td>
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

export default Home;
