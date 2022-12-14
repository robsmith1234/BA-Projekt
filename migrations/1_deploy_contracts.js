var DappToken = artifacts.require("DappToken"); // import DappToken-Contract
var TokenSale = artifacts.require("TokenSale"); // import DappTokenSale-Contract

module.exports = function (deployer) {
	deployer.deploy(DappToken, 1000000).then(function() {	// Deployment des Tokens.
		var tokenPrice = 1000000000000000; 					//in wei == 0,001 Ether.
		return deployer.deploy(TokenSale, DappToken.address, tokenPrice); // Deployment des TokenSales mit Referenz auf den zu verkaufenden Token.
	});
};