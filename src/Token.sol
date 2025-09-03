// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyTaskToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("Watt", "WATT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }
}
