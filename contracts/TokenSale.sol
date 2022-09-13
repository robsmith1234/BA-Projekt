pragma solidity >=0.4.22 <0.9.0;

import "./DappToken.sol";

contract TokenSale {    // Contract der es ermöglicht Token nach ERC20 zu verkaufen.
    address admin;                  // Deklaration: Admin-Variable. Diese wird nicht öffentlich bekannt gegeben.
    DappToken public tokenContract; // Deklaration: Token-Variable
    uint256 public tokenPrice;      // Deklaration: Token-Preis
    uint256 public tokensSold;      // Deklaration: Verkaufte Tokens

    event Sell(address _buyer, uint256 _amount); // Sell Event. Dieses wird von der buyTokens-Funktion aufgerufen.


  	constructor(DappToken _tokenContract, uint256 _tokenPrice){ // Constructor - wird bei Deployement des Smart-Contracts aufgerufen.
        admin = msg.sender;                                     // Admin wird festgelegt (=Deployer des SC). Dieser ist nicht öffentlich einsehbar.
        tokenContract = _tokenContract;                         // Token-SC wird referenziert.
        tokenPrice = _tokenPrice;                               // Festlegung Tokenpreis
    }

    // multiply-function: "Sichere" Multiplikationsfunktion
    function multiply(uint x, uint y) internal pure returns (uint z){   // internal = diese Funktion kann nicht von "außen" aufgerufen werden und hinterlässt keine Spuren auf der Blockchain.
    	require(y == 0 || (z = x* y) / y == x);                         // prüft, ob ein Overflow provoziert wurde: kein overflow wenn -> x * y = z && z / x = y, 5 * 10 = 50 && 50 / 5 = 10.
    }

    //buyTokens: Funktionn die es ermöglicht Ether gegen die virtuellen Tokens, welche im TokenSale angeboten werden, einzutauschen
    function buyTokens(uint256 _numberOfTokens) public payable{ // modifier payable: Ermöglicht es, dass SC Ether senden und empfangen können 
    	
    	require(msg.value == multiply(_numberOfTokens, tokenPrice));        // Prüfung: Enthält die Transaktion genügend Ether. 
    	require(tokenContract.balanceOf(address(this)) >= _numberOfTokens); // Prüfung: Enthält der TokenSale-SC genügend Tokens, um die Transaktion zu vollziehen
    	require(tokenContract.transfer((msg.sender), _numberOfTokens));     // Prüfung: Aufruf transfer-Funktion. Bei erfolgreichem Durchlauf gibt diese "true" zurück
    
    	tokensSold += _numberOfTokens;         // Variable tokensSold wird um die veräußerte Nummer hochgezählt -> wird auf der Verkaufs-Webseite angezeigt

    	emit Sell(msg.sender, _numberOfTokens);// löst das Sell event aus.   
    }

    //endSale-function: Über diese Funktion kann der Token-Sale beendet werden.
    function endSale() public{
    	require(msg.sender == admin); //Prüfung: Ruft der "admin"-Account die Funktion auf.
    	require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this)))); // Prüfung & Ausführung: Rücktransfer zum "admin"-Account muss erfolgreich verlaufen.
    }

}