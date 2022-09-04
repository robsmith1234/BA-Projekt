pragma solidity >=0.4.22 <0.9.0;

contract DappToken {
	
	string public name = "DappToken"; //optional
	string public symbol = "DAPP"; // optional 
	string public standard = "Dapp Token V1.0"; // gives Version - no ERC20
	uint256 public totalSupply; // Variable for total number of token

	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
		);

	mapping(address => uint256) public balanceOf; // Mapping adress and balance of tokens

	constructor (uint256 _initialSupply) { // Constructor
		balanceOf[msg.sender] = _initialSupply; //msg = global variable with data behind it; .sender = adress that calls the function -> current call; Mapping sender & initial supply
		totalSupply = _initialSupply; // sets Token-limit while deploying = Initial Supply

	}


	//Transfer-Function
	
	function transfer(address _to, uint256 _value) public returns (bool success) {
		//Exception if senders-accounts doesn´t have enough Token
		require(balanceOf[msg.sender] >= _value); //if condition is false - running will stop
		//transfer the balance
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;
		//Transfer Event
		emit Transfer(msg.sender, _to, _value);
		//return bool
		return true; // shows that functions ran through
		
	}
}