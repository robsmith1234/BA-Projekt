pragma solidity >=0.4.22 <0.9.0;

contract DappToken { // ERC20 SmartContract
	
	string public name = "DappToken"; //optional
	string public symbol = "DAPP"; // optional 
	string public standard = "Dapp Token V1.0"; // gives Version - no ERC20
	uint256 public totalSupply; // Variable for total number of token

	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
		);

	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint256 _value
		);
	

	mapping(address => uint256) public balanceOf; // Mapping adress and balance of tokens
	mapping(address => mapping(address => uint256)) public allowance; //mapping within mapping -> Account a => Account b => amount of approved tokens
	

	constructor (uint256 _initialSupply) { // Constructor
		balanceOf[msg.sender] = _initialSupply; //msg = global variable with data behind it; .sender = adress that calls the function -> current call; Mapping sender & initial supply
		totalSupply = _initialSupply; // sets Token-limit while deploying = Initial Supply

	}


	//Transfer-Function on own behalft
	
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

	//Delegated Transfer on behalf of a third party (i. e. exchange)

	//approve function - needed to empower a third party to spend tokens
	function approve(address _spender, uint256 _value) public returns(bool success){ //approve an accounts to spend value x
		// allowance
		allowance[msg.sender][_spender] = _value;

		//Approval event
		emit Approval(msg.sender, _spender, _value);
		return true;
	}
	//transferFrom function
	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
		//require _from has enough tokens
		require(_value <= balanceOf[_from]);
		//require allowance is big enough
		require(_value <= allowance[_from][msg.sender]);
		//change balance
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;
		//update allowance
		allowance[_from][msg.sender] -= _value;
		//transfer event
		emit Transfer(_from, _to, _value);
		//return a boolean
		return true;
	}
}