"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { usePublicClient, useWalletClient } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

const Home = () => {
  // Contract and wallet state
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { data: monWarsContract } = useScaffoldContract({
    contractName: "MonanimalWars",
    walletClient,
  });

  // Game state
  const [playerTeam, setPlayerTeam] = useState<string | null>(null);
  const [teamHPs, setTeamHPs] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [playerDamage, setPlayerDamage] = useState<number>(0);
  const [isEligibleForNFT, setIsEligibleForNFT] = useState(false);
  const [showNFTPopup, setShowNFTPopup] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const monanimals = useMemo(
    () => [
      { name: "Moyaki", image: "/images/Moyaki.png" },
      { name: "Mopo", image: "/images/mopo.png" },
      { name: "Chog", image: "/images/Chog1.png" },
      { name: "Salmonad", image: "/images/Salmonad1.png" },
      { name: "Mouch", image: "/images/mosca.png" },
      { name: "Molandak", image: "/images/Molandak.png" },
    ],
    [],
  );

  // Reset states when wallet disconnects
  useEffect(() => {
    if (!address) {
      setPlayerTeam(null);
      setPlayerDamage(0);
      setIsEligibleForNFT(false);
      setShowNFTPopup(false);
    }
  }, [address]);

  // Fetch player's team, HPs, and leaderboard data
  useEffect(() => {
    const fetchGameState = async () => {
      if (monWarsContract) {
        try {
          // Get all team HPs in parallel
          const hpPromises = monanimals.map(monanimal => monWarsContract.read.getTeamHP([monanimal.name]));
          const hpResults = await Promise.all(hpPromises);
          const hps: { [key: string]: number } = {};
          monanimals.forEach((monanimal, index) => {
            hps[monanimal.name] = Number(hpResults[index]);
          });
          setTeamHPs(hps);

          // Only fetch player data if wallet is connected
          if (address) {
            // Get player's team and data in one call
            const player = await monWarsContract.read.getPlayer([address]);
            if (player.teamId > 0) {
              const teamName = await monWarsContract.read.getTeamName([address]);
              setPlayerTeam(teamName);
              setPlayerDamage(Number(player.totalDamageDealt));
            } else {
              setPlayerTeam(null); // Reset player team if they don't have one
            }

            // Check NFT eligibility
            const isEligible = await monWarsContract.read.isPlayerEligibleForNFT([address]);
            if (isEligible && !isEligibleForNFT) {
              setIsEligibleForNFT(true);
              setShowNFTPopup(true);
            }
          }
        } catch (error) {
          console.error("Error fetching game state:", error);
        }
      }
    };

    // Set up event listeners for team defeat and reassignment
    const setupEventListeners = () => {
      if (monWarsContract && publicClient) {
        // Watch for team defeats
        publicClient.watchContractEvent({
          address: monWarsContract.address,
          abi: monWarsContract.abi,
          eventName: "TeamDefeated" as any,
          onLogs: (logs: any[]) => {
            if (logs[0]?.args) {
              const { team } = logs[0].args;
              console.log("Team defeated:", team);
              fetchGameState(); // Refresh game state
            }
          },
        });

        // Watch for player reassignments
        publicClient.watchContractEvent({
          address: monWarsContract.address,
          abi: monWarsContract.abi,
          eventName: "PlayerReassigned" as any,
          onLogs: (logs: any[]) => {
            if (logs[0]?.args) {
              const { player, oldTeam, newTeam } = logs[0].args;
              if (player === address) {
                console.log("You have been reassigned from", oldTeam, "to", newTeam);
                fetchGameState(); // Refresh game state
                // Show notification to user
                alert(`Your team was defeated! You have been reassigned to team ${newTeam}`);
              }
            }
          },
        });
      }
    };

    fetchGameState();
    setupEventListeners();
    const interval = setInterval(fetchGameState, 10000);
    return () => clearInterval(interval);
  }, [address, monWarsContract, isEligibleForNFT, monanimals, publicClient]);

  const handleAttack = async (teamName: string) => {
    if (!monWarsContract || !publicClient || !playerTeam) {
      alert("Please connect your wallet and join a team first");
      return;
    }

    setIsLoading(true);
    try {
      const hash = await monWarsContract.write.attackTeam([teamName]);
      console.log("Waiting for attack confirmation...");
      await publicClient.waitForTransactionReceipt({ hash });

      // Update HP after attack
      const newHP = await monWarsContract.read.getTeamHP([teamName]);
      setTeamHPs(prev => ({ ...prev, [teamName]: Number(newHP) }));
    } catch (error: any) {
      console.error("Error attacking team:", error);
      alert(error.message || "Error attacking team");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeal = async () => {
    if (!monWarsContract || !publicClient || !playerTeam) {
      alert("Please connect your wallet and join a team first");
      return;
    }

    setIsLoading(true);
    try {
      const hash = await monWarsContract.write.healTeam();
      console.log("Waiting for heal confirmation...");
      await publicClient.waitForTransactionReceipt({ hash });

      // Update HP and player damage after heal
      const [newHP, player] = await Promise.all([
        monWarsContract.read.getTeamHP([playerTeam]),
        monWarsContract.read.getPlayer([address as string]),
      ]);

      setTeamHPs(prev => ({ ...prev, [playerTeam]: Number(newHP) }));
      setPlayerDamage(Number(player.totalDamageDealt));
    } catch (error: any) {
      console.error("Error healing team:", error);
      alert(error.message || "Error healing team");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async () => {
    if (!monWarsContract || !publicClient) return;

    setIsMinting(true);
    try {
      const hash = await monWarsContract.write.mintMonavaraNFT();
      console.log("Waiting for mint confirmation...");
      await publicClient.waitForTransactionReceipt({ hash });

      setShowNFTPopup(false);
      alert("Congratulations! You've minted your Legendary Monavara NFT!");
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      alert(error.message || "Error minting NFT");
    } finally {
      setIsMinting(false);
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
      <div className="flex flex-col flex-grow pt-20">
        <div className="w-full py-4 mb-4" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}>
          <h2 className="text-center text-6xl" style={{ fontFamily: "'The Centurion', serif", fontSize: '4.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', color: '#FECA7E' }}>
            Welcome to Monanimal Wars
          </h2>
        </div>
        <div className="w-full py-4" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}>
          <p className="text-center text-lg text-white">
            Choose your Monanimal and attack or heal them! Actions are logged on the blockchain.
          </p>
        </div>

        {/* Game Status Message */}
        {address && playerTeam && (
          <div className="text-center mb-6">
            <p className="text-lg text-white bg-purple-500/50 py-2">
              You are fighting for team {playerTeam}! Attack other teams or heal yours!
            </p>
            <div className="text-lg text-white bg-orange-500/50 py-2 mt-2">
              <p>Your Stats</p>
              <p className="font-bold">Total Damage Dealt: {playerDamage.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Grid of Monanimal Cards */}
        <div
          className="w-full p-8 rounded-lg overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-100"
          style={{
            backgroundImage: `url('/images/BG_team.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            scrollbarWidth: "thin",
            msOverflowStyle: "none",
          }}
        >
          {/* Player's Team Section */}
          {address && playerTeam && (
            <div className="flex justify-center mb-16 min-w-fit px-4">
              {monanimals
                .filter(monanimal => monanimal.name === playerTeam)
                .map(monanimal => (
                  <div
                    key={monanimal.name}
                    className="bg-white/80 backdrop-blur-sm text-center rounded-3xl shadow-lg flex-shrink-0 flex flex-col transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{
                      backgroundImage: "url('/images/carta_devnet.png')",
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      height: "408px",
                      width: "286px",
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    {/* Image Section */}
                    <div className="h-[55%] flex items-center justify-center">
                      <Image
                        src={teamHPs[monanimal.name] > 0 ? monanimal.image : `/images/${monanimal.name}_defeated.png`}
                        alt={monanimal.name}
                        width={monanimal.name === "Molandak" ? 180 : 120}
                        height={monanimal.name === "Molandak" ? 180 : 120}
                        className={`mx-auto ${teamHPs[monanimal.name] === 0 ? "opacity-50 grayscale" : ""}`}
                      />
                    </div>

                    {/* Content Section */}
                    <div className="h-[45%] flex flex-col px-4">
                      {/* Name */}
                      <div className="h-[20%] flex items-end justify-center mt-4">
                        <h3 className="text-xl font-bold">
                          {monanimal.name}
                          {teamHPs[monanimal.name] === 0 && <span className="text-red-500"> (Defeated)</span>}
                        </h3>
                      </div>

                      {/* Health Bar Section */}
                      <div className="h-[25%] flex flex-col justify-start px-6 mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full ${teamHPs[monanimal.name] === 0 ? "bg-gray-500" : "bg-green-500"
                              }`}
                            style={{
                              width: `${((teamHPs[monanimal.name] || 0) / 10000) * 100}%`,
                              transition: "width 0.5s ease-in-out",
                            }}
                          ></div>
                        </div>
                        <p className="text-sm mt-1">HP: {teamHPs[monanimal.name] || 0}/10000</p>
                      </div>

                      {/* Button Section */}
                      <div className="h-[25%] flex items-start justify-center mt-2">
                        <button
                          onClick={handleHeal}
                          disabled={!address || isLoading || teamHPs[monanimal.name] === 10000}
                          className={`w-32 px-4 py-2 ${!address || isLoading || teamHPs[monanimal.name] === 10000
                            ? "bg-gray-400"
                            : "bg-green-500 hover:bg-green-600"
                            } text-white font-bold rounded transition-colors`}
                        >
                          Heal
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Other Teams Section */}
          <div className="flex flex-nowrap justify-center min-w-fit pb-8 px-4" style={{ gap: "100px" }}>
            {monanimals
              .filter(monanimal => monanimal.name !== playerTeam)
              .map(monanimal => (
                <div
                  key={monanimal.name}
                  className="bg-white/80 backdrop-blur-sm text-center rounded-3xl shadow-lg flex-shrink-0 flex flex-col transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    backgroundImage: "url('/images/carta_devnet.png')",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    height: "408px",
                    width: "286px",
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  {/* Image Section */}
                  <div className="h-[55%] flex items-center justify-center">
                    <Image
                      src={teamHPs[monanimal.name] > 0 ? monanimal.image : `/images/${monanimal.name}_defeated.png`}
                      alt={monanimal.name}
                      width={monanimal.name === "Molandak" ? 180 : 120}
                      height={monanimal.name === "Molandak" ? 180 : 120}
                      className={`mx-auto ${teamHPs[monanimal.name] === 0 ? "opacity-50 grayscale" : ""}`}
                    />
                  </div>

                  {/* Content Section */}
                  <div className="h-[45%] flex flex-col px-4">
                    {/* Name */}
                    <div className="h-[20%] flex items-end justify-center mt-4">
                      <h3 className="text-xl font-bold">
                        {monanimal.name}
                        {teamHPs[monanimal.name] === 0 && <span className="text-red-500"> (Defeated)</span>}
                      </h3>
                    </div>

                    {/* Health Bar Section */}
                    <div className="h-[25%] flex flex-col justify-start px-6 mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${teamHPs[monanimal.name] === 0 ? "bg-gray-500" : "bg-blue-500"
                            }`}
                          style={{
                            width: `${((teamHPs[monanimal.name] || 0) / 10000) * 100}%`,
                            transition: "width 0.5s ease-in-out",
                          }}
                        ></div>
                      </div>
                      <p className="text-sm mt-1">HP: {teamHPs[monanimal.name] || 0}/10000</p>
                    </div>

                    {/* Button Section */}
                    <div className="h-[25%] flex items-start justify-center mt-2">
                      <button
                        onClick={() => handleAttack(monanimal.name)}
                        disabled={!address || isLoading || !playerTeam || teamHPs[monanimal.name] === 0}
                        className={`w-32 px-4 py-2 ${!address || isLoading || !playerTeam || teamHPs[monanimal.name] === 0
                          ? "bg-gray-400"
                          : "bg-red-500 hover:bg-red-600"
                          } text-white font-bold rounded transition-colors`}
                      >
                        {teamHPs[monanimal.name] === 0 ? "Defeated" : "Attack"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
