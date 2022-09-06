var DappToken = artifacts.require("DappToken"); // import DappToken-Contract
var TokenSale = artifacts.require("TokenSale"); // import DappTokenSale-Contract

module.exports = function (deployer) {
	deployer.deploy(DappToken, 1000000);
	deployer.deploy(TokenSale);
};