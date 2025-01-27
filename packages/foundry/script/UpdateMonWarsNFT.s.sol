// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {MonanimalWars} from "../contracts/MonanimalWars.sol";

contract UpdateMonWarsNFT is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Get the existing MonanimalWars contract
        MonanimalWars monWars = MonanimalWars(
            0xC1e0A9DB9eA830c52603798481045688c8AE99C2
        );

        // Update the NFT contract address
        monWars.setMonavaraNFT(0xdF46e54aAadC1d55198A4a8b4674D7a4c927097A);

        vm.stopBroadcast();
    }
}
