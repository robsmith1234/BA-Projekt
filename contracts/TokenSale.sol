pragma solidity >=0.4.22 <0.9.0;

import "./DappToken.sol";

contract TokenSale {
    address admin; //not public - don't expose adress of admin
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);


  	constructor(DappToken _tokenContract, uint256 _tokenPrice){
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }
    // safe mutiply-function 
    function multiply(uint x, uint y) internal pure returns (uint z){ //internal = can't be called externally, pure = doesn't have effects on Blockchain,
    	require(y == 0 || (z = x* y) / y == x); //checks possible overflow -> no overflow -> x * y = z && z / x = y
    }

    //Buy Token
    function buyTokens(uint256 _numberOfTokens) public payable{ // functions with modifier payable can send and receive ether -> connect to client wallet
    	
    	// require value euqal to tokenprice
    	require(msg.value == multiply(_numberOfTokens, tokenPrice));

    	// require enough tokens in the contract (aka DappToken) left
    	require(tokenContract.balanceOf(address(this)) >= _numberOfTokens); //this = reference to the -this- Smartcontract = TokenSale

    	// require that a transfer is successfull
    	require(tokenContract.transfer((msg.sender), _numberOfTokens));
    	
    	// track number tokens sold
    	tokensSold += _numberOfTokens;

    	// emit sell event
    	emit Sell(msg.sender, _numberOfTokens);
    }

    //End Sale by Admin
    function endSale() public{
    	// require Admin
    	require(msg.sender == admin);
    	// Transfer remaining dapp tokens to admin
    	require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
    }

}