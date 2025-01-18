// /root/MonanimalWars/packages/nextjs/components/actions.js

"use client";

import React from 'react';
import { useAccount } from 'wagmi';
import { RainbowKitCustomConnectButton } from '~~/components/scaffold-eth';

/**
 * Component for handling Monanimal actions (attack, heal)
 */
const MonanimalActions = ({ healths, setHealths }) => {
  const { isConnected } = useAccount();

  const handleAttack = (index) => {
    if (isConnected) {
      setHealths((prev) =>
        prev.map((health, i) => (i === index ? Math.max(health - 10, 0) : health))
      );
    }
  };

  const handleHeal = (index) => {
    if (isConnected) {
      setHealths((prev) =>
        prev.map((health, i) => (i === index ? Math.min(health + 10, 100) : health))
      );
    }
  };

  return (
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
              <img
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
  );
};

export default MonanimalActions;
