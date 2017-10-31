
function AppViewModel() {
	var self = this;

	p_items1=[]
	p_items2=[]
	for (i=0; i<item_types.length; i++){
		p_items1.push({items:ko.observable(0),upgrades:ko.observable(0)})
		p_items2.push({items:ko.observable(0),upgrades:ko.observable(0)})
	}
	this.playerItems=ko.observableArray(p_items1)
	this.partnerItems=ko.observableArray(p_items2)

	this.items = ko.observableArray(item_types);
	this.player = ko.observableDictionary(playerData);
	this.partner = ko.observableDictionary(partnerData);

	// Increment money for the player due to clicks
	self.incrementPlayer = function() {
		var money = this.player.get('money')();
		var incrementAmount=1;
		this.player.set('money',money+incrementAmount);
	}

	// Handle item purchases
	self.itemPurchase = function(playerNum,itemIndex) {
		if (gameStarted) {
			var itemCost=self.singlePurchaseCost(playerNum,itemIndex);
			if (self.player.get('money')()>=itemCost){
				if (playerNum==0 && item_types[itemIndex].selfPurchase){
					self.player.set('money',self.player.get('money')()-itemCost);
					var currentCount = self.playerItems()[itemIndex].items();
					self.playerItems()[itemIndex].items(currentCount+1);
				}
				else if (playerNum==1)
				{
					self.player.set('money',self.player.get('money')()-itemCost);
					var currentCount = self.partnerItems()[itemIndex].items();
					self.partnerItems()[itemIndex].items(currentCount+1);
				}
			}
		}
	}

	// Handle item upgrades
	self.itemUpgrade = function(playerNum,itemIndex) {
		if (gameStarted) {
			var upgradeCost=self.singleUpgradeCost(0,itemIndex);
			var itemCost=self.singleUpgradeCost(playerNum,itemIndex);
			if (self.player.get('money')()>=upgradeCost){
				self.player.set('money',self.player.get('money')()-upgradeCost);
				var currentCount = self.playerItems()[itemIndex].upgrades();
				self.playerItems()[itemIndex].upgrades(currentCount+1);
			}
		}
	}

	// Find the income generated from a single item type
	self.itemIncome = function(player,i) {
		if (player == 0){
			var quantity = self.playerItems()[i].items();
			var value = item_types[i].baseRate + self.playerItems()[i].upgrades() * item_types[i].upgradeRate ;
		}
		else
		{
			var quantity = self.partnerItems()[i].items();
			var value = item_types[i].baseRate + self.partnerItems()[i].upgrades() * item_types[i].upgradeRate ;
		}
		return quantity*value;
	}

	// Find the income generated from a single item type
	self.singlePurchaseCost = function(playerNum,itemIndex) {
		if (playerNum == 0){
			var quantityOwned = self.playerItems()[itemIndex].items();
		} else {
			var quantityOwned = self.partnerItems()[itemIndex].items();
		}
		var quantityMultiplier = Math.pow(1.1,quantityOwned);
		return item_types[itemIndex].baseCost * quantityMultiplier;
	}

	// Find the income generated from a single item type
	self.singleUpgradeCost = function(playerNum,itemIndex) {
		var quantityOwned = self.playerItems()[itemIndex].upgrades();
		var quantityMultiplier = Math.pow(1.05,quantityOwned);
		return item_types[itemIndex].upgradeCost * quantityMultiplier;
	}

	self.formattedMoney = ko.computed(function(){
		return self.player.get('money')().toFixed(0);
	});
	self.formattedMinned = ko.computed(function(){
		return self.player.get('minned')().toFixed(0);
	});
	self.formattedNumber = function(i, precision = 0) {
		return i.toFixed(precision);
	}

	// Find the total income
	self.totalPlayerIncome = ko.computed(function() {
		var income=0;
		for (var i=0; i<self.playerItems().length; i++){
			income+=self.itemIncome(0,i);
		}
		return income;
	});
	self.totalPartnerIncome = ko.computed(function() {
		var income=0;
		for (var i=0; i<self.partnerItems().length; i++){
			income+=self.itemIncome(1,i);
		}
		return income;
	});

	// Find the income generated from a single item type
	self.giveIncome = function(rateMultiplier) {
		var money = self.player.get('money')();
		var minned = self.player.get('minned')();
		var inc = self.totalPlayerIncome()*rateMultiplier;
		money += inc;
		minned += inc;
		self.player.set('money',money);
		self.player.set('minned',minned);
	}

	self.updatePartnerItems = function(newPartnerItems){
		// For every item which is sent in the update
		for (i=0; i<newPartnerItems.length; i++){
			// Read the values for that item
			var current_name = newPartnerItems[i].item.name;
			var current_qty = newPartnerItems[i].quantity;
			// Search for the item with a matching name
			for (var j=0; j<item_types.length; j++){
				if (item_types[j].name == current_name){
					// If the item cannot be purchased by the player then the partner has control.
					if (item_types[j].selfPurchase){
						self.partnerItems()[j].items(current_qty)
					}
				}
			}
		}
	}

	self.updatePlayerItems = function(newPlayerItems){
		// For every item which is sent in the update
		for (var i=0; i<newPlayerItems.length; i++){
			// Read the values for that item
			var current_name = newPlayerItems[i].item.name;
			var current_qty = newPlayerItems[i].quantity;
			// Search for the item with a matching name
			for (var j=0; j<item_types.length; j++){
				if (item_types[j].name == current_name){
					// If the item cannot be purchased by the player then the partner has control.
					if (!item_types[j].selfPurchase){
						self.playerItems()[j].items(current_qty)
					}
				}
			}
		}
	}

	self.updatePartnerInfo = function(newPartnerInfo){
		self.partner.set('money',newPartnerInfo.wealth)
		self.partner.set('minned',newPartnerInfo.mined)
	}

}