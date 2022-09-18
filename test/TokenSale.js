var TokenSale = artifacts.require("TokenSale");
var DappToken = artifacts.require("DappToken");

contract("TokenSale", function(accounts){
	var tokenSaleInstance;
	var tokenInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tokenPrice = 1000000000000000; 	//in wei -> kleinste Ether-Einheit entspricht 0,001 Ether - es gibt keine Gleitkommazahlen; vergleichbar wenn wir alles in Cent rechnen würden, like 1 € = 100 Cents
	var tokensAvailable = 750000;		// Anzahl an Token, die für den Sale verfügbar sind (von 100.000)
	var numberOfTokens;

	it('1. Test: Wird der SC mit den richtigen Werten initialisiert?', function() {
	    return TokenSale.deployed().then(function(instance) {
	      tokenSaleInstance = instance;
	      return tokenSaleInstance.address
	    }).then(function(address) {
	      assert.notEqual(address, 0x0, '... der TokenSale-SC hat keine Adresse');
	      return tokenSaleInstance.tokenContract();
	    }).then(function(address) {
	      assert.notEqual(address, 0x0, '... der Token-SC hat keine Adresse');
	      return tokenSaleInstance.tokenPrice();
	    }).then(function(price) {
	      assert.equal(price, tokenPrice, '... der Token-Preis ist nicht korrekt');
	    });
	});

	it("2. Test: Wird der Token-Kauf erfolgreich abgewickelt?", function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;		// zuerst wird der Token instanziiert - die Reihenfolge ist wichtig.
			return TokenSale.deployed();
		}).then(function(instance){
			tokenSaleInstance = instance;	// danach wird TokenSale instanziiert
			return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin}) // Bereitstellung von 75 % der Gesamtsumme
		}).then(function(receipt){
			numberOfTokens = 10;
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice}) // value = Summe von wei
		}).then(function(receipt){
			 assert.equal(receipt.logs.length, 1, 'es sollte nur ein Event getriggert werden');
			 assert.equal(receipt.logs[0].event, 'Sell', 'es sollte das "Sell"-Event getriggert werden');
			 assert.equal(receipt.logs[0].args._buyer, buyer, 'der Käufer-Account stimmt nicht überein');
			 assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'die Anzal der gekauften Token stimmt nicht überein');
			return tokenSaleInstance.tokensSold();
		}).then(function (amount) {
			assert.equal(amount.toNumber(), numberOfTokens, "... die Nummer der verkauften Tokens muss entsprechend erhöht werden");
			return tokenInstance.balanceOf(buyer);
		}).then(function (balance) {
			assert.equal(balance.toNumber(), numberOfTokens);
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function (balance) {
			assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens, "das neue Guthaben muss mit den übrigen Token übereinstimmen");
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1}); //versucht zu niedrig (wei-value) zu kaufen 
		}).then(assert.fail).catch(function(error){
			assert(error.message.toString().indexOf("revert") >=0, "msg.value muss tokens * wei entsprechen");
			return tokenSaleInstance.buyTokens(numberOfTokens+ 1, {from: buyer, value: numberOfTokens * tokenPrice}); // versucht mehr Token als verfügbar zu kaufen
		}).then(assert.fail).catch(function(error){
			assert(error.message.toString().indexOf("revert") >=0, "es können nich mehr Token als verfügbar gekauft werden"); 
		});
	});

	it("3. Test: Wird der Token-Sale ordnungsgemäß beendet?", function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return TokenSale.deployed();
		}).then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.endSale({from: buyer}); //versucht Token-Sale von Account != admin zu beenden
		}).then(assert.fail).catch(function (error) {
			assert(error.message.toString().indexOf("revert") >=0, "die Beendigung kann nur durch den Admin durchgeführt werden");
			// end sale as admin
			return tokenSaleInstance.endSale({from: admin});
		}).then(function(receipt){
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 999990, "Summe der zurücktransferierten Tokens stimmt nicht überein"); // 10 sind oben transferiert worden, also müssen 999990 zurück gehen
		})
	});
});


