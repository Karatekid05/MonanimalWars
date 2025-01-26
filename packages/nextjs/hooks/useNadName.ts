import { createPublicClient, http } from "viem";
import { monadDevnet } from "~~/scaffold.config";

const NNS_CONTRACT_ADDRESS = "0x3019BF1dfB84E5b46Ca9D0eEC37dE08a59A41308";
const NNS_ABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "addr",
                type: "address",
            },
        ],
        name: "getPrimaryNameForAddress",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    }
] as const;

// Create a public client instance
const publicClient = createPublicClient({
    chain: monadDevnet,
    transport: http(),
});

export const useNadName = () => {
    const verifyNadName = async (address: string): Promise<string | null> => {
        console.log("Checking .nad name for address:", address);

        try {
            // Call the contract directly
            console.log("Calling getPrimaryNameForAddress...");
            const primaryName = await publicClient.readContract({
                address: NNS_CONTRACT_ADDRESS,
                abi: NNS_ABI,
                functionName: "getPrimaryNameForAddress",
                args: [address],
            });

            console.log("Primary name result:", primaryName);

            // If the address has a primary name, return it with .nad suffix
            if (primaryName && primaryName.length > 0) {
                // Add .nad suffix if it's not already there
                return primaryName.endsWith('.nad') ? primaryName : `${primaryName}.nad`;
            }

            return null;
        } catch (error) {
            console.error("Error checking .nad name:", error);
            return null;
        }
    };

    return {
        verifyNadName,
    };
}; 