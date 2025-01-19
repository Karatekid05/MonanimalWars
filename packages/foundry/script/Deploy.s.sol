// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {MonanimalWars} from "../contracts/MonanimalWars.sol";
import {MonavaraNFT} from "../contracts/MonavaraNFT.sol";

contract Deploy is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // First deploy MonanimalWars
        MonanimalWars monWars = new MonanimalWars();

        // Then deploy MonavaraNFT with baseURI
        MonavaraNFT nft = new MonavaraNFT("/nft-metadata/");

        // Set up contract connections
        nft.setMonWarsContract(address(monWars));
        monWars.setMonavaraNFT(address(nft));

        vm.stopBroadcast();
    }
}
