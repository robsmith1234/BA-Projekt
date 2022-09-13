pragma solidity >=0.4.22 <0.9.0; //verwendete Solidity-Version

contract DappToken { // ERC20 SmartContract
	
	string public name = "Token"; // optional nach ERC20-Standard: Initialisierung Token-Namen.
	string public symbol = "FOM"; // optional nach ERC20-Standard: Initialisierung Token-Symbol.
	uint256 public totalSupply; // zwingend nach ERC20-Standard: Variable for total number of token.

	mapping(address => uint256) public balanceOf; //zwingend nach ERC20-Standard: Mappt die Adresse und die zugehörige Tokenanzahl -> kann ausgelesen werden um Guthaben zu erfahren.
	mapping(address => mapping(address => uint256)) public allowance; //zwingend nach ERC20-Standard: Mappt zwei Adressen und die zugehörigen bevollmächtigten Token, s. u. transferFrom.
	


	event Transfer(				//zwingend nach ERC20-Standard: Wird von der transfer-Funktion aufgerufen.
		address indexed _from,
		address indexed _to,
		uint256 _value
		);

	event Approval(				//zwingend nach ERC20-Standard: Wird von der approve-Funktion aufgerufen.
		address indexed _owner,
		address indexed _spender,
		uint256 _value
		);
		

	constructor  (uint256 _initialSupply) { 	// Constructor - wird bei Deployement des Smart-Contracts aufgerufen.
		balanceOf[msg.sender] = _initialSupply; // msg.sender entspricht dem Deployer des Tokens. Dieser bekommt bei Deployment alle Token zugewiesen.
		totalSupply = _initialSupply; 			// Die insgesamt verfügbare Menge wird bei Deployment gedeckelt.
	}


	//transfer-Funktion - zwingend nach ERC20-Standard: Ermöglicht es Tokens zu transferieren.
	function transfer(address _to, uint256 _value) public returns (bool success) {
		require(balanceOf[msg.sender] >= _value); 	// Prüfung: Verfügt der Sendende über die Menge Tokens, die er senden will.
		balanceOf[msg.sender] -= _value;			// Der Sendende bekommt die gesendete Menge an Tokens abgezogen.
		balanceOf[_to] += _value;					// Der Empfangende bekommt die gesendete Menge an Tokens gutgeschrieben.
		emit Transfer(msg.sender, _to, _value);		// Das Transfer-Event wird nach erfolgreichem Transfer aufgerufen.
		return true; 								// True-Rückgabe signalisiert, das die transfer-Funktion erfolgreich durchgelaufen ist.
		
	}

	//Im Folgenden: Funktionen, die es ermöglichen einen Dritten zum Transfer der eigenen Token zu bevollmächtigen.

	//approve-Funktion - zwingend nach ERC20-Standard: Aufrufer der Funktion ermächtigt den _spender Tokens in Höhe von _value auszugeben.
	function approve(address _spender, uint256 _value) public returns(bool success){ //approve an accounts to spend value x
		allowance[msg.sender][_spender] = _value; 	// erhöht die allowance (s.o.) um den Betrage _value.

		emit Approval(msg.sender, _spender, _value);// Das Approval-Event wird nach erfolgreichem Transfer aufgerufen.

		return true;								// True-Rückgabe signalisiert, das die transfer-Funktion erfolgreich durchgelaufen ist.
	}
	// transferFrom-Funktion - zwingend nach ERC20-Standard: Bevollmächtigt einen anderen Account (_to) einen Betrag in Höhe von _value auszugeben. Der Aufrufer der Funktion (msg.sender) ist der Bevollmächtigte.
	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
		require(_value <= balanceOf[_from]); 			// Prüfung: Hat der Bevollmächtigende überhaupt die Tokens, die potenziell freigegeben sind.
		require(_value <= allowance[_from][msg.sender]);// Prüfung: Besteht überhaupt die Bevollmächtigung von _from an msg.sender in Höhe der angegeben Token.

		balanceOf[_from] -= _value;						// Der Bevollmächtigende bekommt seine Tokenanzahl entsprechend _value erniedrigt.
		balanceOf[_to] += _value;						// Der Empfänger bekommt seine Tokenanzahl entsprechend _value erhöht.

		allowance[_from][msg.sender] -= _value;			// Da der Bevollmächtigte nun einen Teil des Guthabens über das er verfügen darf ausgegeben hat, wird die allowance entsprechend reduziert.
		
		emit Transfer(_from, _to, _value);				// Das Transfer-Event wird nach erfolgreichem Transfer aufgerufen.

		return true;									// True-Rückgabe signalisiert, das die transfer-Funktion erfolgreich durchgelaufen ist.
	}
}