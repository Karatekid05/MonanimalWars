import { http } from "viem";
import { createConfig } from "wagmi";
import { monadDevnet } from "~~/scaffold.config";

export const wagmiConfig = createConfig({
    chains: [monadDevnet],
    transports: {
        [monadDevnet.id]: http(monadDevnet.rpcUrls.default.http[0], {
            batch: true,
            fetchOptions: {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        }),
    },
}); 