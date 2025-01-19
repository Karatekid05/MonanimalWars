"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useWalletClient } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

type TeamStats = {
  name: string;
  image: string;
  topPlayers: Array<{
    username: string;
    damageDealt: number;
  }>;
  totalPlayers: number;
  totalDamageDealt: number;
  totalHealing: number;
  currentHP: number;
};

const Statistics = () => {
  const { data: walletClient } = useWalletClient();
  const { data: monWarsContract } = useScaffoldContract({
    contractName: "MonanimalWars",
    walletClient,
  });

  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalPlayers: 0,
    totalDamageDealt: 0,
    totalHealing: 0,
    totalTransactions: 0,
    attackTransactions: 0,
    healTransactions: 0,
    teamSelections: 0,
    registrations: 0,
  });

  const monanimals = useMemo(
    () => [
      { name: "Moyaki", image: "/images/Moyaki.png" },
      { name: "Mopo", image: "/images/mopo.png" },
      { name: "Chog", image: "/images/Chog1.png" },
      { name: "Salmonad", image: "/images/Salmonad1.png" },
      { name: "Mouch", image: "/images/mosca.png" },
    ],
    [],
  );

  useEffect(() => {
    const fetchTeamStats = async () => {
      if (!monWarsContract) return;

      try {
        // Batch all global stats calls together
        const [totalTx, attacks, heals, selections, registrations] = await Promise.all([
          monWarsContract.read.getTotalTransactions(),
          monWarsContract.read.totalAttacks(),
          monWarsContract.read.totalHeals(),
          monWarsContract.read.totalTeamSelections(),
          monWarsContract.read.totalRegistrations(),
        ]);

        // Batch all team data fetching
        const teamDataPromises = monanimals.map(async monanimal => {
          const [players, currentHP] = await Promise.all([
            monWarsContract.read.getTeamPlayers([monanimal.name]),
            monWarsContract.read.getTeamHP([monanimal.name]),
          ]);

          // Batch all player data fetching for this team
          const playerDataPromises = players.map(player => monWarsContract.read.getPlayer([player]));
          const playerData = await Promise.all(playerDataPromises);

          const playerStats = playerData.map(data => ({
            username: data.username,
            damageDealt: Number(data.totalDamageDealt),
          }));

          const topPlayers = playerStats.sort((a, b) => b.damageDealt - a.damageDealt).slice(0, 5);

          const teamDamage = playerStats.reduce((sum, player) => sum + player.damageDealt, 0);

          return {
            name: monanimal.name,
            image: monanimal.image,
            currentHP: Number(currentHP),
            totalPlayers: players.length,
            totalDamageDealt: teamDamage,
            totalHealing: 0, // Add healing calculation if available
            topPlayers,
          };
        });

        const teamsData = await Promise.all(teamDataPromises);

        // Calculate global totals from team data
        const globalTotalPlayers = teamsData.reduce((sum, team) => sum + team.totalPlayers, 0);
        const globalTotalDamage = teamsData.reduce((sum, team) => sum + team.totalDamageDealt, 0);
        const globalTotalHealing = teamsData.reduce((sum, team) => sum + team.totalHealing, 0);

        setTeamStats(teamsData);
        setGlobalStats(prev => ({
          ...prev,
          totalPlayers: globalTotalPlayers,
          totalDamageDealt: globalTotalDamage,
          totalHealing: globalTotalHealing,
          totalTransactions: Number(totalTx),
          attackTransactions: Number(attacks),
          healTransactions: Number(heals),
          teamSelections: Number(selections),
          registrations: Number(registrations),
        }));
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchTeamStats();

    // Set up an interval to refresh data every 30 seconds
    const interval = setInterval(fetchTeamStats, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [monWarsContract, monanimals]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat py-10 px-5"
      style={{
        backgroundImage: `url('/images/BG_site.png')`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Global Stats */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-3xl font-bold text-center mb-6">Global Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-100 rounded-lg">
              <p className="text-lg font-semibold">Total Players</p>
              <p className="text-2xl font-bold">{globalStats.totalPlayers}</p>
            </div>
            <div className="text-center p-4 bg-red-100 rounded-lg">
              <p className="text-lg font-semibold">Total Damage Dealt</p>
              <p className="text-2xl font-bold">{globalStats.totalDamageDealt.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-green-100 rounded-lg">
              <p className="text-lg font-semibold">Total Healing</p>
              <p className="text-2xl font-bold">{globalStats.totalHealing.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-blue-100 rounded-lg">
              <p className="text-lg font-semibold">Total Transactions</p>
              <p className="text-2xl font-bold">{globalStats.totalTransactions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamStats.map(team => (
            <div key={team.name} className="bg-white/90 backdrop-blur-sm rounded-xl p-6">
              {/* Fixed height header container */}
              <div className="h-16 flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{team.name}</h3>
                <div className="w-16 h-16 flex items-center justify-center">
                  <Image
                    src={team.image}
                    alt={team.name}
                    width={64}
                    height={64}
                    className="rounded-full object-contain"
                  />
                </div>
              </div>

              {/* Team HP Bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">HP:</span>
                  <span>{team.currentHP} / 10000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="h-4 rounded-full bg-green-500"
                    style={{
                      width: `${(team.currentHP / 10000) * 100}%`,
                      transition: "width 0.5s ease-in-out",
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Total Players: {team.totalPlayers}</p>
                  <p className="font-semibold">Total Damage: {team.totalDamageDealt.toLocaleString()}</p>
                  <p className="font-semibold">Total Healing: {team.totalHealing.toLocaleString()}</p>
                </div>

                {/* Top Players */}
                {team.topPlayers.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-2">Top 5 Players</h4>
                    <div className="space-y-2">
                      {team.topPlayers.map((player, index) => (
                        <div key={player.username} className="flex justify-between items-center">
                          <span>
                            {index + 1}. {player.username}
                          </span>
                          <span className="font-mono">{player.damageDealt.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
