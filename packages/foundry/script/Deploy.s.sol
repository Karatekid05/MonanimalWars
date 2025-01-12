//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {MonanimalWars} from "../contracts/MonanimalWars.sol";

contract DeployScript is Script {
    function run() external returns (MonanimalWars) {
        vm.startBroadcast();
        MonanimalWars monanimalWars = new MonanimalWars();
        vm.stopBroadcast();
        return monanimalWars;
    }
}
