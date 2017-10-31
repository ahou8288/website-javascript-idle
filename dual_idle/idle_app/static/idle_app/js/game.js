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

// Exposes a link for reference/debugging purposes
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
	for (var i=0; i<playerItems.length; i++){
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

// Gets a dictionary with names as keys and indexs as values
function getNameIndex(my_array){
	var outValue = {};
	for (var i=0; i<my_array.length; i++){
		outValue[my_array[i].name]=i
	}
	return outValue;
}

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

		vm.player.get("name")(saved_game['me']['name']);
		vm.partner.get("name")(saved_game['partner']['name']);

		playerItems=ko.toJS(vm.playerItems);
		partnerItems=ko.toJS(vm.partnerItems);

		name_index=getNameIndex(item_types)

		// console.log(name_index)
		console.log(saved_game['my_stuff'].length);

		for (var i=0; i<saved_game['my_stuff'].length; i++){
			console.log('blah')
			current_item = saved_game['my_stuff'][i];
			current_name = current_item.item.name;
			
			console.log(ko.toJS(vm.playerItems));

			vm.playerItems()[name_index[current_name]]["items"](current_item['quantity']);
			vm.playerItems()[name_index[current_name]]["upgrades"](current_item['upgradeQuantity']);
			console.log(i);
		}

		for (var i=0; i<saved_game['partners_stuff'].length; i++){
			current_item = saved_game['partners_stuff'][i];
			current_name = current_item.item.name;
			vm.partnerItems()[name_index[current_name]]["items"](current_item['quantity']);
		}
	}
	if (typeof(saved_game) != 'undefined')
		initGame(saved_game);
	
	gameStarted=true;

	// begin updating the game state
	updatesPerSecond=1;
	setInterval(function() {
		sendData();
	}, 1000/updatesPerSecond);
	sendData();
});

