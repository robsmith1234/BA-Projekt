var DappToken = artifacts.require("DappToken");



contract("DappToken", function(accounts){
	var tokenInstance;
	var wantedBalance = 1000000;

	it("1. Test: Wird der SC mit den richtigen Werten initialisiert?", function(){ // Prüfung: Entspricht der Name und das Symbol unseren Vorgaben?
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name){
			assert.equal(name, "Token", "... hat nicht den richtigen Namen");
		return tokenInstance.symbol();
		}).then(function (symbol) {
			assert.equal(symbol, "FOM", "... hat nicht das richtige Symbol");
		});
	})


	it("2. Test: Wird das Guthaben in richtiger Höhe verteilt?", function(){ // Prüfung: Entspricht die Guthaben-Verteilung unseren Vorgaben?
		return DappToken.deployed().then(function (instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply){
			assert.equal(totalSupply.toNumber(), wantedBalance, "die totalSupply-Variable entspricht nicht den Vorgaben");
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function (adminBalance) {
			assert.equal(adminBalance.toNumber(), wantedBalance, "das Guthaben des Admin-Kontos entspricht nicht der totalSupply-Variable")
		});
	});


it("3. Test: Wird ein Transfer ordnungsgemäß durchgeführt?", function(){ // Prüfung: hier werden verschiedene Tests rund um den Token-Transfer ausgeführt.
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.transfer.call(accounts[1], 999999999999); 
		}).then(assert.fail).catch(function(error){
			assert(error.message.toString().indexOf("revert") >=0, "fehlerhafte Übermittlung wird nicht abgefangen");
			return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
		}).then(function(success){
			assert.equal(success, true, "es wird kein true-Wert zurückgebenen; der Transfer war somit nicht erfolgreich");
			return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]}); // Testung eines Transfers i. H. v. 25.000 Token
		}).then(function(receipt){ // das receipt entsteht nach erfolgreich durchgeführtem Transfer und enthält verschiedene Informationen
			 assert.equal(receipt.logs.length, 1, 'es sollte nur ein Event getriggert werden');
			 assert.equal(receipt.logs[0].event, 'Transfer', 'es sollte das "Transfer"-Event getriggert werden');
			 assert.equal(receipt.logs[0].args._from, accounts[0], 'der Transfer-From Account stimmt nicht überein');
			 assert.equal(receipt.logs[0].args._to, accounts[1], 'der Transfer-To Account stimmt nicht überein');
			 assert.equal(receipt.logs[0].args._value, 250000, 'die Transfer-Summe stimmt nicht überein');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance){	// überprüft das Guthaben nach Durchführung des Transfers - Empfänger
			assert.equal(balance.toNumber(), 250000, "Summe stimmt nicht mit Transfer-Summe überein - Empfänger");
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance){	// überprüft das Guthaben nach Durchführung des Transfers - Sender
			assert.equal(balance.toNumber(), 750000, "Summe stimmt nicht mit Transfer-Summe überein - Sender");
		});
	});


	it("4. Test: Wird die approve-Funktion ordnungsgemäß ausgeführt?", function(){ // Prüfung: hier werden Tests rund um die approve-Funktion durchgeführt
		return DappToken.deployed().then(function (instance) {
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100); 
		}).then(function (success) {
			assert.equal(success, true, "es wird kein true-Wert zurückgebenen; aprrove war somit nicht erfolgreich");
			return tokenInstance.approve(accounts[1], 100, {from: accounts[0]}); // erlaubt account[1] 100 Tokens von account[0] auszugeben
		}).then(function(receipt){
			  assert.equal(receipt.logs.length, 1, 'es sollte nur ein Event getriggert werden');
			  assert.equal(receipt.logs[0].event, 'Approval', 'es sollte das "Approval"-Event getriggert werden');
			  assert.equal(receipt.logs[0].args._owner, accounts[0], 'der Approval-From Account stimmt nicht überein');
			  assert.equal(receipt.logs[0].args._spender, accounts[1], 'der Approval-To Account stimmt nicht überein');
			  assert.equal(receipt.logs[0].args._value, 100, 'die Approval-Summe stimmt nicht überein');
			  return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(), 100, "die Allowance-Summe von _from zu _to stimmt nicht überein");
		});
	});


	it("5. Test: Wird die transferFrom-Funktion ordnungsgemäß ausgeführt?", function(){ // Prüfung: hier werden Tests rund um die transferFrom-Funktion durchgeführt
		return DappToken.deployed().then(function (instance) { // Initialisierung des Tokens und der drei Beteiligten Accounts
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];
			return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]}); // Voraussetzung, dass Tokens transferiert werden können, ist das der fromAccount über das entsprechende Guthaben verfügt -> wird hier transferiert
		}).then(function(receipt){
			return tokenInstance.approve(spendingAccount, 10, {from: fromAccount}); //approve des spending-Accounts
		}).then(function(receipt){
			return tokenInstance.transferFrom(fromAccount, toAccount, 999, {from: spendingAccount}); // Test: transferring-Summe > verfügbare Summe
		}).then(assert.fail).catch(function(error){
			assert(error.message.toString().indexOf("revert")>=0, "Transfer zurückgewiesen: Es kann keine größere Summe als das Guthaben transferiert werden");
			return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount}); // Test: transferring-Summe > freigegebene Summe
		}).then(assert.fail).catch(function(error){
			assert(error.message.toString().indexOf("revert")>=0, "Transfer zurückgewiesen: Es kann keine größere Summe als die freigegebene Summer transferiert werden");
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount}); 
		}).then(function(success){
			assert.equal(success, true, "es wird kein true-Wert zurückgebenen; der delegated-Transfer war somit nicht erfolgreich");
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount}); // Dieser Test ist valide und sollte durchgehen -> es wird ein Transfer-Event erzeugt
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'es sollte nur ein Event getriggert werden');
			assert.equal(receipt.logs[0].event, 'Transfer', 'es sollte das "Transfer"-Event getriggert werden');
			assert.equal(receipt.logs[0].args._from, fromAccount, 'der Transfer-From Account stimmt nicht überein');
			assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
			assert.equal(receipt.logs[0].args._value, 10, 'die Transfer-Summe stimmt nicht überein');
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 90, "Summe stimmt nicht mit Transfer-Summe überein - Sender");
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 10, "Summe stimmt nicht mit Transfer-Summe überein - Empfänger");
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(), 0, "Summe stimmt nicht mit allowance-Summe überein");
		});
	});	
})
