"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect, useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useNadName } from "~~/hooks/useNadName";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

export const RainbowKitCustomConnectButton = () => {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const { verifyNadName } = useNadName();
    const [nadName, setNadName] = useState<string | null>(null);
    const [gameUsername, setGameUsername] = useState<string | null>(null);
    const { data: monWarsContract } = useScaffoldContract({
        contractName: "MonanimalWars",
    });

    // Check for game username
    useEffect(() => {
        const checkGameUsername = async () => {
            if (monWarsContract && address) {
                try {
                    const player = await monWarsContract.read.getPlayer([address]);
                    if (player.isRegistered) {
                        setGameUsername(player.username);
                    } else {
                        setGameUsername(null);
                    }
                } catch (error) {
                    console.error("Error checking game username:", error);
                    setGameUsername(null);
                }
            } else {
                setGameUsername(null);
            }
        };

        checkGameUsername();
    }, [monWarsContract, address]);

    // Check for .nad name
    useEffect(() => {
        const checkNadName = async () => {
            if (address) {
                const name = await verifyNadName(address);
                setNadName(name);
            } else {
                setNadName(null);
            }
        };

        checkNadName();
    }, [address, verifyNadName]);

    return (
        <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                    <div
                        {...(!ready && {
                            "aria-hidden": true,
                            style: {
                                opacity: 0,
                                pointerEvents: "none",
                                userSelect: "none",
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        className="btn border-2 border-[#FECA7E] bg-transparent text-[#FECA7E] hover:bg-[#FECA7E] hover:text-black font-bold transition-all duration-200"
                                    >
                                        Connect Wallet
                                    </button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        className="btn border-2 border-[#FECA7E] bg-transparent text-[#FECA7E] hover:bg-[#FECA7E] hover:text-black font-bold transition-all duration-200"
                                    >
                                        Wrong network
                                    </button>
                                );
                            }

                            return (
                                <div className="flex items-center">
                                    <button
                                        onClick={openChainModal}
                                        className="btn border-2 border-[#FECA7E] bg-transparent text-[#FECA7E] hover:bg-[#FECA7E] hover:text-black font-bold transition-all duration-200 mr-2"
                                        style={{ display: "flex", alignItems: "center" }}
                                    >
                                        {chain.hasIcon && (
                                            <div
                                                style={{
                                                    background: chain.iconBackground,
                                                    width: 18,
                                                    height: 18,
                                                    borderRadius: 999,
                                                    overflow: "hidden",
                                                    marginRight: 4,
                                                }}
                                            >
                                                {chain.iconUrl && (
                                                    <img
                                                        alt={chain.name ?? "Chain icon"}
                                                        src={chain.iconUrl}
                                                        style={{ width: 18, height: 18 }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {chain.name}
                                    </button>

                                    <button
                                        onClick={openAccountModal}
                                        className="btn border-2 border-[#FECA7E] bg-transparent text-[#FECA7E] hover:bg-[#FECA7E] hover:text-black font-bold transition-all duration-200"
                                    >
                                        {gameUsername || nadName || account.displayName}
                                        {account.displayBalance ? ` (${account.displayBalance})` : ""}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}; 