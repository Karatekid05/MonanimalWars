// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {MonavaraNFT} from "../contracts/MonavaraNFT.sol";
import {MonanimalWars} from "../contracts/MonanimalWars.sol";

contract DeployUpdatedNFT is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the new NFT contract with the correct baseURI
        MonavaraNFT nft = new MonavaraNFT(
            "https://raw.githubusercontent.com/Karatekid05/MonanimalWars/main/packages/nextjs/public/nft-metadata/"
        );

        // Set the MonWars contract address
        nft.setMonWarsContract(0xC1e0A9DB9eA830c52603798481045688c8AE99C2);

        vm.stopBroadcast();
    }
}
