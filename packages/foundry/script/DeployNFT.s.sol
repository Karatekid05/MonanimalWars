// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {MonavaraNFT} from "../contracts/MonavaraNFT.sol";
import {MonanimalWars} from "../contracts/MonanimalWars.sol";

contract DeployNFT is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy MonavaraNFT with baseURI
        MonavaraNFT nft = new MonavaraNFT("/nft-metadata/");

        // Get the existing MonanimalWars contract address
        address monWarsAddress = 0x1c85638e118b37167e9298c2268758e058DdfDA0; // Current deployed contract address
        MonanimalWars monWars = MonanimalWars(monWarsAddress);

        // Set up contract connections
        nft.setMonWarsContract(monWarsAddress);
        monWars.setMonavaraNFT(address(nft));

        vm.stopBroadcast();
    }
}
