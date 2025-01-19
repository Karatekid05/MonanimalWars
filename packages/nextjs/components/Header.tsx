"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

const monanimals = [
  { name: "Moyaki", image: "/images/Moyaki.png" },
  { name: "Mopo", image: "/images/mopo.png" },
  { name: "Chog", image: "/images/Chog1.png" },
  { name: "Salmonad", image: "/images/Salmonad1.png" },
  { name: "Mouch", image: "/images/mosca.png" },
];

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

  const [username, setUsername] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const { data: monWarsContract } = useScaffoldContract({
    contractName: "MonanimalWars",
    walletClient,
  });

  // Add leaderboard state
  const [leaderboard, setLeaderboard] = useState<
    Array<{
      playerAddress: string;
      username: string;
      damageDealt: number;
    }>
  >([]);

  // Add function to fetch leaderboard
  const fetchLeaderboard = async () => {
    if (monWarsContract) {
      try {
        const leaderboardData = await monWarsContract.read.getLeaderboard();
        setLeaderboard(
          leaderboardData.map(entry => ({
            playerAddress: entry.playerAddress,
            username: entry.username,
            damageDealt: Number(entry.damageDealt),
          })),
        );
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    }
  };

  // Fetch leaderboard when opening modal
  const handleShowLeaderboard = () => {
    fetchLeaderboard();
    setShowLeaderboard(true);
  };

  // Verificar se o usuário está registrado
  useEffect(() => {
    const checkRegistration = async () => {
      if (monWarsContract && address) {
        try {
          const player = await monWarsContract.read.getPlayer([address]);
          setIsRegistered(player.isRegistered);
          if (player.isRegistered) {
            setUsername(player.username);
            if (player.teamId > 0) {
              const teamName = await monWarsContract.read.getTeamName([address]);
              const team = monanimals.find(m => m.name === teamName);
              if (team) {
                setSelectedMonanimal(team);
              }
            }
          }
        } catch (error) {
          console.error("Error checking registration:", error);
        }
      }
    };

    checkRegistration();
  }, [monWarsContract, address]);

  // Registrar username
  const handleRegisterUsername = async () => {
    if (!monWarsContract || !publicClient) {
      alert("Please connect your wallet first");
      return;
    }

    if (username.trim()) {
      try {
        const hash = await monWarsContract.write.registerPlayer([username.trim()]);
        console.log("Waiting for transaction confirmation...");

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log("Registration successful", receipt);

        // Update the registration status and username after successful transaction
        const player = await monWarsContract.read.getPlayer([address as string]);
        setIsRegistered(player.isRegistered);
        setUsername(player.username);
        setShowUsernameModal(false);
      } catch (error: any) {
        console.error("Detailed error:", error);
        if (error.message.includes("Username already taken")) {
          alert("This username is already taken. Please try another one.");
        } else if (error.message.includes("Player already registered")) {
          alert("You are already registered. Please refresh the page.");
        } else {
          alert("Error registering username. Please try again.");
        }
      }
    } else {
      alert("Please enter a username");
    }
  };

  const selectRandomMonanimal = () => {
    // Just show the popup, no transaction yet
    setShowKingPopup(true);
  };

  const revealMonanimal = async () => {
    if (!monWarsContract || !publicClient) return;

    try {
      setAnimationStarted(true);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Select team in one transaction
      const hash = await monWarsContract.write.selectTeam();
      console.log("Waiting for team selection confirmation...");
      await publicClient.waitForTransactionReceipt({ hash });

      // Get the assigned team
      const teamName = await monWarsContract.read.getTeamName([address as string]);
      const team = monanimals.find(m => m.name === teamName);

      if (team) {
        setMonanimalRevealed(team);
        setSelectedMonanimal(team);
      }

      setAnimationStarted(false);
    } catch (error) {
      console.error("Error selecting team:", error);
      setAnimationStarted(false);
      setShowKingPopup(false);
    }
  };

  const finalizeSelection = () => {
    setShowKingPopup(false);
  };

  return (
    <div className="sticky top-0 navbar bg-base-200 min-h-0 flex-shrink-0 justify-between z-20 border-b-2 border-base-100 px-4 py-4">
      <div className="navbar-start flex gap-4 items-center">
        <Link href="/" className="hover:opacity-75 transition-opacity">
          <Image src="/images/placa.png" alt="Monanimal Wars Logo" width={80} height={28} className="object-contain" />
        </Link>
        <button
          onClick={handleShowLeaderboard}
          className="btn btn-primary text-white font-bold px-4 py-2 rounded-md hover:bg-primary-focus"
        >
          Show Leaderboard
        </button>
        <Link href="/statistics" className="btn btn-info text-white font-bold px-4 py-2 rounded-md hover:bg-info-focus">
          Statistics
        </Link>
        <Link
          href="/team"
          className="btn btn-secondary text-white font-bold px-4 py-2 rounded-md hover:bg-secondary-focus"
        >
          Meet the Team
        </Link>
      </div>

      <div className="navbar-end flex gap-4">
        {!isRegistered ? (
          <button onClick={() => setShowUsernameModal(true)} className="btn btn-primary">
            Register Username
          </button>
        ) : (
          <div className="font-bold text-lg">{username}</div>
        )}
        {isRegistered &&
          (selectedMonanimal ? (
            <div className="font-bold text-lg text-purple-500">Team: {selectedMonanimal.name}</div>
          ) : (
            <button
              onClick={selectRandomMonanimal}
              className="btn btn-accent text-white font-bold px-4 py-2 rounded-md hover:bg-accent-focus"
            >
              Select Monanimal
            </button>
          ))}
        <RainbowKitCustomConnectButton />
      </div>

      {/* Modal de Username */}
      {showUsernameModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Choose Your Username</h2>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button onClick={handleRegisterUsername} className="btn btn-primary w-full">
              Confirm
            </button>
          </div>
        </div>
      )}

      {showKingPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            {!monanimalRevealed ? (
              <>
                {!animationStarted ? (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-center">King Monavara&apos;s Decision</h2>
                    <div className="flex flex-col items-center">
                      <Image
                        src="/images/Monavara-scooter.png"
                        alt="King Monavara"
                        width={128}
                        height={128}
                        className="mb-4"
                      />
                      <p className="text-center text-lg font-bold mb-2">
                        Now King Monavara will decide your path on the battlefield.
                      </p>
                      <p className="text-center text-sm mb-4">Fight with honor and seek glory!</p>
                      <button
                        onClick={revealMonanimal}
                        className="btn btn-primary mt-4 hover:bg-purple-600 transition-colors duration-200"
                        style={{
                          padding: "0.75rem 1.5rem",
                          borderRadius: "0.5rem",
                        }}
                      >
                        Reveal Your Monanimal
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-lg font-bold">The decision is being made...</p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4 text-center">Your Monanimal</h2>
                <div className="flex flex-col items-center">
                  <Image
                    src={monanimalRevealed?.image || ""}
                    alt={monanimalRevealed?.name || ""}
                    width={128}
                    height={128}
                    className="mb-4"
                  />
                  <p className="text-center text-lg font-bold mb-4">{monanimalRevealed?.name}</p>
                  <button
                    onClick={finalizeSelection}
                    className="btn btn-primary mt-4 hover:bg-purple-600 transition-colors duration-200"
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "0.5rem",
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 w-3/4 max-w-2xl shadow-lg relative">
            <button
              onClick={() => setShowLeaderboard(false)}
              className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white font-bold rounded hover:bg-red-600"
            >
              Close
            </button>
            <h2 className="text-2xl font-bold text-center mb-6">Global Leaderboard</h2>
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-300">
                    <th className="py-2 px-4 text-left">Rank</th>
                    <th className="py-2 px-4 text-left">Player</th>
                    <th className="py-2 px-4 text-right">Damage Dealt</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, index) => (
                    <tr
                      key={player.playerAddress}
                      className={`${
                        player.playerAddress === address ? "bg-purple-100" : index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="py-2 px-4">{index + 1}</td>
                      <td className="py-2 px-4">{player.username}</td>
                      <td className="py-2 px-4 text-right">{player.damageDealt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
