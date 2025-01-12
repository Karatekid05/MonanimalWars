"use client";

import { useState } from "react";
// import { useAccount } from "wagmi";
import Image from "next/image";

const Home = () => {
  // State for Monanimals
  const initialHealth = 100;
  const [healths, setHealths] = useState<number[]>(
    Array(6).fill(initialHealth), // Initialize with 5 Monanimals, each with 100 health
  );

  // Leaderboard data (placeholder for now)
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

  const handleAttack = (index: number) => {
    setHealths(prev => prev.map((health, i) => (i === index ? Math.max(health - 10, 0) : health)));
  };

  const handleHeal = (index: number) => {
    setHealths(prev => prev.map((health, i) => (i === index ? Math.min(health + 10, 100) : health)));
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/images/BG_site.png')`,
      }}
    >
      <div className="flex items-center flex-col flex-grow pt-10">
        {/* Header Section */}
        <h2 className="text-center text-3xl font-bold mb-8 text-white">Welcome to Monanimal Wars</h2>
        <p className="text-center text-lg mb-12 text-white">
          Choose your favorite Monanimal and attack or heal them! Actions are logged on the blockchain.
        </p>

        {/* Grid de cards - remova o background branco */}
        <div className="grid grid-cols-5 gap-8 justify-center p-8">
          {[
            { name: "Moyaki", image: "/images/Moyaki.png" },
            { name: "Molandak", image: "/images/Molandak1.png" },
            { name: "Chog", image: "/images/Chog1.png" },
            { name: "Salmonad", image: "/images/Salmonad1.png" },
            { name: "Mouch", image: "/images/mosca.png" },
          ].map((monanimal, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm px-6 py-6 text-center rounded-3xl shadow-lg flex flex-col h-full"
            >
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                  <Image src={monanimal.image} alt={monanimal.name} width={120} height={120} className="mx-auto" />
                </div>

                <div className="mt-auto flex flex-col items-center">
                  <h3 className="text-xl font-bold">{monanimal.name}</h3>
                  <p className="text-md my-2">Health: {healths[index]}</p>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => handleAttack(index)}
                  className="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600"
                >
                  Attack
                </button>
                <button
                  onClick={() => handleHeal(index)}
                  className="px-4 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600"
                >
                  Heal
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Leaderboard Section */}
        <div className="mt-16 bg-base-100 rounded-xl p-8 shadow-lg">
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
    </div>
  );
};

export default Home;
