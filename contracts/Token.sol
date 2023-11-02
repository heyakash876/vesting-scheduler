// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;
import "./ERC20.sol";

contract Token is ERC20{
	constructor(string memory name_, string memory symbol_,address orgAddress, uint256 initialSupply) ERC20(name_, symbol_) {
		_mint(orgAddress, initialSupply);
	}
	function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool){
		return ERC20.transfer(from, to, amount);
	}
	function balanceOf(address account) public view virtual override returns (uint256) {
		return ERC20.balanceOf(account);
	}
}