var TokenSale = artifacts.require("TokenSale");


contract("TokenSale", function(accounts){
	var tokenSaleInstance;

	it("initializes the contract with the correct values", function(){
		return TokenSale.deployed().then(function (instance) {
			tokenSaleInstance = instance;
			return tokenSaleInstance.adress
		}).then(function(address){
			assert.notEqual(address, 0x0, "has contract address");
		});
	});
})