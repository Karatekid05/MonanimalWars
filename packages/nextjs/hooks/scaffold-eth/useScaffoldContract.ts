import { usePublicClient } from "wagmi";
import { useTargetNetwork } from "./useTargetNetwork";
import { Account, Address, Chain, Client, Transport, getContract } from "viem";
import { GetWalletClientReturnType } from "wagmi/actions";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

/**
 * Gets a viem instance of the contract present in deployedContracts.ts or externalContracts.ts corresponding to
 * targetNetworks configured in scaffold.config.ts. Optional walletClient can be passed for doing write transactions.
 * @param config - The config settings for the hook
 * @param config.contractName - deployed contract name
 * @param config.walletClient - optional walletClient from wagmi useWalletClient hook can be passed for doing write transactions
 */
export const useScaffoldContract = <
  TContractName extends ContractName,
  TWalletClient extends GetWalletClientReturnType | null = GetWalletClientReturnType | null,
>({
  contractName,
  walletClient,
}: {
  contractName: TContractName;
  walletClient: TWalletClient;
}) => {
  const { data: deployedContractData } = useDeployedContractInfo(contractName);
  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork.id });

  if (!deployedContractData) {
    return { data: undefined };
  }

  const contract = getContract({
    address: deployedContractData.address,
    abi: deployedContractData.abi,
    walletClient: walletClient as any,
    publicClient,
  });

  return {
    data: {
      ...contract,
      address: deployedContractData.address,
      abi: deployedContractData.abi,
      read: contract,
      write: contract,
    },
  };
};
