// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {MonavaraNFT} from "../contracts/MonavaraNFT.sol";

contract UpdateNFTBaseURI is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Get the deployed NFT contract
        MonavaraNFT nft = MonavaraNFT(
            0xd3FFD73C53F139cEBB80b6A524bE280955b3f4db
        );

        // Update the baseURI to point to the folder, as we'll always use 1.json
        nft.setBaseURI(
            "https://raw.githubusercontent.com/Karatekid05/MonanimalWars/main/packages/nextjs/public/nft-metadata/"
        );

        vm.stopBroadcast();
    }
}
