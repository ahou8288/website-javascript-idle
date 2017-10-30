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
// End of stackoverflow code

var gameLoadTime = Math.floor(Date.now() / 1000);
gameStarted=false

// Activates knockout.js
ko.applyBindings(new AppViewModel());

// Exposes a link for debugging purposes
var vm = ko.dataFor(document.body);

// This function sends data to the server
// When the game is running it will be called periodically
// For now it just runs at game startup only

function sendData(){
	//Send a post with everything
	var jsonString = JSON.stringify(getGameData());
	$.ajax({
		type: "POST",
		url: 'update',
		data: {data: jsonString, csrfmiddlewaretoken: getCookie('csrftoken')},
		success: function(result) {
			vm.updatePartnerItems(result.partnerItems)
			vm.updatePlayerItems(result.playerItems)
			vm.updatePartnerInfo(result.partnerUserGame)
		}
	});
}

function getGameData(){
	outValue={
		"userGame": {
			"user": {
				"displayName": vm.player.get("name")(),
				"id": vm.player.get("id")(), // Where is the vm.player.set() ???? this needs to be the value from the initial view render
			},
			"wealth": vm.player.get("money")(),
			"game": {
				"id": saved_game.game.id
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
		if (!item_types[i].selfPurchase){
			outValue['partnerItems'].push({
				'item':itemInfo,
				'quantity':partnerItems[i].items,
				'upgradeQuantity':partnerItems[i].upgrades
			});
		}
		outValue['playerItems'].push({
			'item':itemInfo,
			'quantity':playerItems[i].items,
			'upgradeQuantity':playerItems[i].upgrades,
			'updateItemQuantity':item_types[i].selfPurchase
		});
	}
	return outValue;
};

// Begin generating coins
timesPerSecond=30; // Increases workload but smooths money generation.
setInterval(function() {
	vm.giveIncome(1/timesPerSecond);
}, 1000/timesPerSecond);

$(document).ready(function(){
	// load the saved game state
	function initGame(saved_game){
		// vm.player.get("name")(saved_game['TODO'])
		vm.player.get("money")(saved_game['me']['wealth']);
		vm.partner.get("money")(saved_game['partner']['wealth']);
		vm.player.get("minned")(saved_game['me']['mined']);

		playerItems=ko.toJS(vm.playerItems);
		partnerItems=ko.toJS(vm.partnerItems);

		for (i=0; i<saved_game['my_stuff'].length; i++){
			current_item = saved_game['my_stuff'][i]
			current_name = current_item.item.name
			for (j=0; j<item_types.length;j++){
				if (item_types[j].name == current_name){
					vm.playerItems()[j]["items"](current_item['quantity']);
				}
			}
		}
		for (i=0; i<saved_game['partners_stuff'].length; i++){
			current_item = saved_game['partners_stuff'][i]
			current_name = current_item.item.name
			for (j=0; j<item_types.length;j++){
				if (item_types[j].name == current_name){
					vm.partnerItems()[j]["items"](current_item['quantity']);
				}
			}
		}
	}
	if (typeof(saved_game) != 'undefined')
		initGame(saved_game);

	// begin updating the game state
	updatesPerSecond=1;
	setInterval(function() {
		sendData();
	}, 1000/updatesPerSecond);
	sendData();
});

gameStarted=true;