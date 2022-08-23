pragma solidity >=0.4.22 <0.9.0;

contract DappToken {
	
	uint256 public totalSupply; // Variable for total number of token

	 constructor () public{ // Constructor
		totalSupply = 1000000;
	}
}