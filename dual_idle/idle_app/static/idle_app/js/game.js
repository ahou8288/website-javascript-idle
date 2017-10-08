// Stackoverflow code
// Hides an element with an id
ko.bindingHandlers.hoverTargetId = {};
ko.bindingHandlers.hoverVisible = {
	init: function (element, valueAccessor, allBindingsAccessor) {

		function showOrHideElement(show) {
			var canShow = ko.utils.unwrapObservable(valueAccessor());
			$(element).toggle(show && canShow);
		}

		var hideElement = showOrHideElement.bind(null, false);
		var showElement = showOrHideElement.bind(null, true);
		var $hoverTarget = $("#" + ko.utils.unwrapObservable(allBindingsAccessor().hoverTargetId));
		ko.utils.registerEventHandler($hoverTarget, "mouseover", showElement);
		ko.utils.registerEventHandler($hoverTarget, "mouseout", hideElement);
		hideElement();
	}
};

var gameLoadTime = Math.floor(Date.now() / 1000);
gameStarted=false

item_types=[
	{
		id:1,
		icon:"calculator",
		name:"Calculator",
		baseRate:0.2,
		baseCost:10,
		upgradeRate:0.2,
		upgradeCost:50,
		selfPurchase:true,
	}
	,
	{
		id:2,
		icon:"desktop",
		name:"Computer",
		baseRate:1.2,
		baseCost:100,
		upgradeRate:1.2,
		upgradeCost:500,
		selfPurchase:true,
	}
	,
	{
		id:3,
		icon:"bicycle",
		name:"Bicycle",
		baseRate:12,
		baseCost:1000,
		upgradeRate:12,
		upgradeCost:5000,
		selfPurchase:false,
	}
];

playerData={name:"Bob",money:200,minned:0,id:0}
partnerData={name:"Jeff",money:10,id:1}

// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
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
		for (i=0; i<self.playerItems().length; i++){
			income+=self.itemIncome(0,i);
		}
		return income;
	});
	self.totalPartnerIncome = ko.computed(function() {
		var income=0;
		for (i=0; i<self.partnerItems().length; i++){
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

}

// Activates knockout.js
ko.applyBindings(new AppViewModel());

// Exposes a link for debugging purposes
var vm = ko.dataFor(document.body);

// This function sends data to the server
// When the game is running it will be called periodically
// For now it just runs at game startup only
sendData();

function sendData(){
	//Send a post with everything
	console.log('sending post')
	var jsonString = JSON.stringify(getGameData());
	$.ajax({
		type: "POST",
		url: 'update',
		data: {data: jsonString, csrfmiddlewaretoken: getCookie('csrftoken')},
		success: function(result) {
			// Result was confusing
			// window.console.log(result);
		}
	});
}

function getGameData(){
	outValue={
		"userGame": {
			"user": {
				"displayName": vm.player.get("name")(),
				"id": vm.player.get("id")(),
			},
			"wealth": vm.player.get("money")(),
			"game": {
				"id": 1 //TODO
			},
			"mined": vm.player.get("minned")(),
			"timePlayed": 0, //TODO
		},
		"playerItems": [],
		"partnerItems": []
	}

	playerItems=ko.toJS(vm.playerItems)
	partnerItems=ko.toJS(vm.partnerItems)
	for (i=0; i<playerItems.length; i++){
		itemInfo={
					"name": item_types[i].name,
					"baseValue": item_types[i].baseRate,
					"baseCost": item_types[i].baseCost,
					"upgradeValue": item_types[i].upgradeRate,
					"upgradeCost": item_types[i].upgradeCost
				}

		outValue['playerItems'].push({
			'item':itemInfo,
			'quantity':playerItems[i].items,
			'upgradeQuantity':playerItems[i].upgrades
		});
		outValue['partnerItems'].push({
			'item':itemInfo,
			'quantity':partnerItems[i].upgrades,
			'upgradeQuantity':partnerItems[i].upgrades
		});
	}
	// console.log(outValue);
	return outValue;
};

// Begin generating coins
timesPerSecond=100;
setInterval(function() {
	vm.giveIncome(1/timesPerSecond);
}, 1000/timesPerSecond);

gameStarted=true;