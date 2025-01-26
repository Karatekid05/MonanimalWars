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
            {({ account, chain, openConnectModal, mounted }) => {
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
                                    <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
                                        Connect Wallet
                                    </button>
                                );
                            }

                            return (
                                <div className="flex justify-end items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end bg-base-100 rounded-lg p-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="text-xs font-medium text-gray-500">{chain.name}</span>
                                            </div>
                                            <span className="text-sm font-bold">
                                                {account.displayBalance}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => disconnect()}
                                            className="btn btn-primary btn-sm"
                                        >
                                            {gameUsername || nadName || account.displayName}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}; 