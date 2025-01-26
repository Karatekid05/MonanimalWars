"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { useNadName } from "~~/hooks/useNadName";

const monanimals = [
  { name: "Moyaki", image: "/images/Moyaki.png" },
  { name: "Mopo", image: "/images/mopo.png" },
  { name: "Chog", image: "/images/Chog1.png" },
  { name: "Salmonad", image: "/images/Salmonad1.png" },
  { name: "Mouch", image: "/images/mosca.png" },
  { name: "Molandak", image: "/images/Molandak.png" },
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
  const [usernameType, setUsernameType] = useState<"custom" | "nad">("custom");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const { verifyNadName } = useNadName();

  const [nadName, setNadName] = useState<string | null>(null);
  const [showNadConfirmation, setShowNadConfirmation] = useState(false);

  const [showRules, setShowRules] = useState(false);

  // Reset states when wallet disconnects
  useEffect(() => {
    if (!address) {
      setSelectedMonanimal(null);
      setShowKingPopup(false);
      setMonanimalRevealed(null);
      setUsername("");
      setShowUsernameModal(false);
      setIsRegistered(false);
      setIsRegistering(false);
      setErrorMessage(null);
      setNadName(null);
      setShowNadConfirmation(false);
    }
  }, [address]);

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

  // Verificar se o usuário está registrado e sua equipe
  useEffect(() => {
    const checkRegistration = async () => {
      if (monWarsContract && address) {
        try {
          const player = await monWarsContract.read.getPlayer([address]);
          setIsRegistered(player.isRegistered);

          if (player.isRegistered) {
            setUsername(player.username);

            // Verificar equipe
            if (player.teamId > 0) {
              const teamName = await monWarsContract.read.getTeamName([address]);
              console.log("Player team:", teamName);
              const team = monanimals.find(m => m.name === teamName);
              if (team) {
                console.log("Setting team:", team.name);
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

  // Update the registration handler
  const handleRegisterUsername = async () => {
    if (!monWarsContract || !publicClient) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    if (!username.trim()) {
      setErrorMessage("Please enter a username");
      return;
    }

    setIsRegistering(true);
    setErrorMessage(null);

    try {
      let finalUsername = username.trim();

      if (usernameType === "nad") {
        // Verify if the address has a .nad name
        const nadName = await verifyNadName(address as string);
        if (!nadName) {
          setErrorMessage("You don't have any .nad name registered");
          setIsRegistering(false);
          return;
        }
        finalUsername = nadName;
      }

      const tx = await monWarsContract.write.registerPlayer([finalUsername]);
      console.log("Waiting for transaction confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("Registration successful", receipt);

      const player = await monWarsContract.read.getPlayer([address as string]);
      setIsRegistered(player.isRegistered);
      setUsername(player.username);
      setShowUsernameModal(false);
      setErrorMessage(null);
    } catch (error: any) {
      console.error("Detailed error:", error);
      if (error.message.includes("Username already taken")) {
        setErrorMessage("This username is already taken. Please try another one.");
      } else if (error.message.includes("Player already registered")) {
        setErrorMessage("You are already registered. Please refresh the page.");
      } else {
        setErrorMessage("Error registering username. Please try again.");
      }
    } finally {
      setIsRegistering(false);
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

  // Add function to check for .nad name when modal opens
  const handleOpenUsernameModal = async () => {
    console.log("Opening username modal");
    console.log("Current address:", address);

    setShowUsernameModal(true);
    setShowNadConfirmation(false);
    setNadName(null);
    setErrorMessage(null);

    if (address) {
      try {
        console.log("Checking for .nad name...");
        const existingNadName = await verifyNadName(address);
        console.log("Existing .nad name result:", existingNadName);

        if (existingNadName) {
          console.log("Setting .nad name:", existingNadName);
          setNadName(existingNadName);
          setShowNadConfirmation(true);
        } else {
          console.log("No .nad name found, showing regular input");
          setShowNadConfirmation(false);
        }
      } catch (error) {
        console.error("Error checking .nad name:", error);
        setShowNadConfirmation(false);
      }
    } else {
      console.log("No address connected");
    }
  };

  // Add function to handle .nad name confirmation
  const handleNadNameConfirmation = (useNadName: boolean) => {
    if (useNadName && nadName) {
      setUsername(nadName);
      setUsernameType("nad");
    } else {
      setUsernameType("custom");
    }
    setShowNadConfirmation(false);
  };

  return (
    <div className="sticky lg:static top-0 navbar bg-gradient-to-r from-[#2A2A2A] to-[#1A1A1A] min-h-0 flex-shrink-0 justify-between z-20 px-0 sm:px-2 border-b border-[#FECA7E]/20">
      <div className="navbar-start w-auto lg:w-1/2">
        <Link href="/" className="hover:opacity-75 transition-opacity">
          <Image src="/images/placa.png" alt="Monanimal Wars Logo" width={80} height={28} className="object-contain" />
        </Link>
        <button
          onClick={handleShowLeaderboard}
          className="btn border-2 border-[#FECA7E] bg-transparent text-[#FECA7E] hover:bg-[#FECA7E] hover:text-black font-bold px-4 py-2 rounded-md transition-all duration-200"
        >
          Show Leaderboard
        </button>
        <Link
          href="/statistics"
          className="btn border-2 border-[#FECA7E] bg-transparent text-[#FECA7E] hover:bg-[#FECA7E] hover:text-black font-bold px-4 py-2 rounded-md transition-all duration-200 ml-2"
        >
          Statistics
        </Link>
        <Link
          href="/team"
          className="btn border-2 border-[#FECA7E] bg-transparent text-[#FECA7E] hover:bg-[#FECA7E] hover:text-black font-bold px-4 py-2 rounded-md transition-all duration-200 ml-2"
        >
          Meet the Team
        </Link>
      </div>

      <div className="navbar-end flex-grow mr-4 flex items-center gap-4">
        {address && !isRegistered ? (
          <button
            onClick={handleOpenUsernameModal}
            className="btn bg-[#FECA7E] text-black hover:bg-[#FED99E] border-none font-bold"
          >
            Register Username
          </button>
        ) : selectedMonanimal ? (
          <div className="flex items-center gap-2">
            <div className="font-bold text-lg text-[#FECA7E]">Team {selectedMonanimal.name}</div>
          </div>
        ) : address ? (
          <button
            onClick={selectRandomMonanimal}
            className="btn bg-[#FECA7E] text-black hover:bg-[#FED99E] border-none font-bold px-4 py-2 rounded-md"
          >
            Select Monanimal
          </button>
        ) : null}
        <button
          className="btn border-2 border-[#FECA7E] bg-transparent text-[#FECA7E] hover:bg-[#FECA7E] hover:text-black font-bold transition-all duration-200"
          onClick={() => setShowRules(true)}
        >
          Rules
        </button>
        <RainbowKitCustomConnectButton />
      </div>

      {/* Username Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowUsernameModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              aria-label="Close"
            >
              &times;
            </button>

            {showNadConfirmation ? (
              // .nad Name Confirmation Dialog
              <>
                <h2 className="text-xl font-bold mb-4">We noticed you have a .nad name!</h2>
                <p className="text-lg mb-4">Would you like to use <span className="font-bold">{nadName}</span> as your username?</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleNadNameConfirmation(true)}
                    className="flex-1 btn btn-primary"
                  >
                    Yes, use my .nad name
                  </button>
                  <button
                    onClick={() => handleNadNameConfirmation(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    No, use custom username
                  </button>
                </div>
              </>
            ) : (
              // Regular Username Input
              <>
                <h2 className="text-xl font-bold mb-4">Choose Your Username</h2>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Choose a unique username for the game
                </p>
                {errorMessage && (
                  <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
                )}
                <button
                  onClick={handleRegisterUsername}
                  className="btn btn-primary w-full"
                  disabled={isRegistering}
                >
                  {isRegistering ? "Registering..." : "Confirm"}
                </button>
              </>
            )}
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
                    <h2 className="text-2xl font-bold mb-4 text-center">Wizard Monavara&apos;s Decision</h2>
                    <div className="flex flex-col items-center">
                      <Image
                        src="/images/Monavara-scooter.png"
                        alt="Wizard Monavara"
                        width={128}
                        height={128}
                        className="mb-4"
                      />
                      <p className="text-center text-lg font-bold mb-2">
                        Now Wizard Monavara will decide your path on the battlefield.
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
                      className={`${player.playerAddress === address ? "bg-purple-100" : index % 2 === 0 ? "bg-gray-50" : "bg-white"
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

      {/* Rules Popup */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] rounded-xl p-8 max-w-2xl w-full text-center relative shadow-[0_0_30px_rgba(254,202,126,0.3)] border border-[#FECA7E]/20">
            <button
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 text-xl font-bold text-[#FECA7E] hover:text-[#FED99E]"
            >
              ×
            </button>
            <h2 className="text-4xl mb-8" style={{ fontFamily: "'The Centurion', serif", color: '#FECA7E', fontSize: '3.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Game Rules</h2>

            <div className="text-left space-y-4 text-white">
              <h3 className="text-xl font-bold text-[#FECA7E]">Getting Started</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Connect your wallet to start playing</li>
                <li>Choose a username or use your .nad name</li>
                <li>You'll be randomly assigned to one of six Monanimal teams</li>
              </ul>

              <h3 className="text-xl font-bold text-[#FECA7E] mt-6">Gameplay</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Each team starts with 10,000 HP</li>
                <li>Attack other teams to reduce their HP</li>
                <li>Heal your team to restore HP</li>
                <li>Teams with 0 HP are marked as defeated</li>
              </ul>

              <h3 className="text-xl font-bold text-[#FECA7E] mt-6">Special Rewards 🎁</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Keep an eye on your total damage dealt...</li>
                <li>A legendary surprise awaits brave warriors!</li>
                <li><span className="text-sm italic">(Hint: The King might notice your valor after 10 attacks or 1,000 damage)</span></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
