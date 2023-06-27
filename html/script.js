/* 
 * Copyright 2022-2023 Jamie Vital
 * This software is licensed under the GNU General Public License
 * 
 * This file is part of Vitality GOES.
 * Vitality GOES is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Vitality GOES is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Vitality GOES.  If not, see <http://www.gnu.org/licenses/>.
 */

//Global variables
var sideBar = false;
var lightGalleries = [];
var xhttp = [];
var config, responseData, selectedMenu;
var programPath = document.currentScript.src.replace(location.protocol + "//" + location.hostname, "").split("script.js?v=")[0];
var siteName = window.matchMedia('(display-mode: standalone)').matches ? "" : " - " + document.title;

//Load expanded cards from sessionStorage
storedExpandedCards = sessionStorage.getItem('expandedCards');
if(storedExpandedCards == null)
{
	var expandedCards = [];
	sessionStorage.setItem('expandedCards', "[]");
}
else
{
	try{var expandedCards = JSON.parse(storedExpandedCards);}
	catch(error)
	{
		var expandedCards = [];
		sessionStorage.setItem('expandedCards', "[]");
	}
}
function getCookie(name)
{
	return decodeURIComponent((name = (document.cookie + ';').match(new RegExp(name + '=.*;'))) && name[0].split(/=|;/)[1]);
}
function setCookie(name, value)
{
	e = new Date;
	e.setDate(e.getDate() + 365);
	document.cookie = name + "=" + encodeURIComponent(value) + ';expires=' + e.toUTCString() + ';path=/;domain=.' + document.domain;
}
function encodeProfile(profileArray)
{
	profileParts = [];
	profileArray.forEach((thisLocation) => {
		profileParts.push([
			(thisLocation.hasOwnProperty('city') ? thisLocation.city : ""),
			(thisLocation.hasOwnProperty('lat') ? thisLocation.lat : ""),
			(thisLocation.hasOwnProperty('lon') ? thisLocation.lon : ""),
			(thisLocation.hasOwnProperty('orig') ? thisLocation.orig : ""),
			(thisLocation.hasOwnProperty('radarCode') ? thisLocation.radarCode : ""),
			(thisLocation.hasOwnProperty('rwrOrig') ? thisLocation.rwrOrig : ""),
			(thisLocation.hasOwnProperty('stateAbbr') ? thisLocation.stateAbbr : ""),
			(thisLocation.hasOwnProperty('timezone') ? thisLocation.timezone : ""),
			(thisLocation.hasOwnProperty('wxZone') ? thisLocation.wxZone : "")
		].join("!"));
	});
	
	return profileParts.join('~');
}
function encodeOtherEmwinConfig(emwinArray)
{
	emwinParts = [];
	emwinArray.forEach((thisEmwin) => {
		emwinParts.push([
			(thisEmwin.hasOwnProperty('identifier') ? btoa(thisEmwin.identifier).replace(/=/g, "-") : ""),
			(thisEmwin.hasOwnProperty('title') ? thisEmwin.title : ""),
			(thisEmwin.hasOwnProperty('format') ? (thisEmwin.format == "formatted" ? 0 : 1) : 0),
			(thisEmwin.hasOwnProperty('truncate') ? thisEmwin.truncate : "")
		].join("!"));
	});
	
	return emwinParts.join('~');
}
function decodeProfile(profileString)
{
	profileArray = [];
	allLocations = profileString.split("~");
	allLocations.forEach((thisLocation) => {
		profileParts = thisLocation.split("!");
		if(profileParts.length != 9) return;
		profileArray.push({
			'city': profileParts[0],
			'lat': profileParts[1],
			'lon': profileParts[2],
			'orig': profileParts[3],
			'radarCode': profileParts[4],
			'rwrOrig': profileParts[5],
			'stateAbbr': profileParts[6],
			'timezone': profileParts[7],
			'wxZone': profileParts[8]
		});
	});
	
	return profileArray;
}
function slideDrawer()
{
	document.getElementById('sideBar').style.transform = "translateX(" + (sideBar ? '-305px' : '0px') + ")";
	sideBar = (sideBar ? false : true);
}
function retractDrawer()
{
	if(sideBar)
	{
		document.getElementById('sideBar').style.transform = 'translateX(-305px)';
		sideBar = false;
	}
}
function renderMenuItem(index, icon, name)
{
	newMenuItem = document.createElement('div');
	newMenuItem.className = 'menuItem';
	newMenuItem.id = 'menuItem' + index;
	newMenuItem.addEventListener('click', function(){menuSelect(index)});
	newMenuItem.innerHTML = "<div class='menuItemIconHolder'><i class='fa fa-" + icon + "' aria-hidden='true'></i></div><div style='vertical-align: middle; display: inline-block;'>" + name + "</div>";
	document.getElementById('sideBar').appendChild(newMenuItem);
}
function removeCard(target)
{
	target.parentElement.parentElement.nextSibling.remove();
	target.parentElement.parentElement.remove();
}
function renderImageCard(slug, color)
{
	card = document.createElement('div');
	card.className = "prettyBox";
	if(color != null) card.style.backgroundColor = color;
	
	header = document.createElement('div');
	header.className = "prettyBoxHeader";
	header.innerHTML = "<i class='fa fa-chevron-" + (expandedCards.includes(slug + "Content") ? "down" : "right") + "' aria-hidden='true'></i>" + config.categories[selectedMenu].data[slug].title;
	header.addEventListener('click', showCollapseCard);
	card.appendChild(header);
	content = document.createElement('div');
	content.id = slug + "Content";
	content.className = "prettyBoxContent";
	content.innerHTML = "Loading, please wait...";
	content.style.display = expandedCards.includes(slug + "Content") ? "block" : "none";
	card.appendChild(content);
	
	if(config.categories[selectedMenu].data[slug].videoPath)
	{
		links = document.createElement('div');
		links.className = "mapLinks";
		links.style.display = expandedCards.includes(slug + "Content") ? "block" : "none";
		recent = document.createElement('span');
		recent.className = "spanLink selected";
		recent.innerHTML = "Current";
		recent.id = slug + "-Recent";
		recent.addEventListener("click", switchCardView);
		links.appendChild(recent);
		sevenDay = document.createElement('span');
		sevenDay.className = "spanLink";
		sevenDay.innerHTML = "Timelapse";
		sevenDay.id = slug + "-timelapse";
		sevenDay.addEventListener("click", switchCardView);
		links.appendChild(sevenDay);
		card.appendChild(links);
	}
	
	mainContent.appendChild(card);
	
	//Extra Element to Help with Card Flow
	mainContent.appendChild(document.createElement('div'));
	
	//Load image, if necessary
	if(expandedCards.includes(slug + "Content")) loadImageMetadata(content);
}
function renderCollapsingCard(slug, name, cardClass, bodyClass)
{
	card = document.createElement('div');
	card.className = "prettyBox";
	cardHeader = document.createElement('div');
	cardHeader.className = "prettyBoxHeader";
	cardHeader.innerHTML = "<i class='fa fa-chevron-" + (expandedCards.includes(slug + "Content") ? "down" : "right") + "' aria-hidden='true'></i>" + name;
	cardHeader.addEventListener('click', showCollapseCard);
	card.appendChild(cardHeader);
	cardContent = document.createElement('div');
	cardContent.className = cardClass;
	cardContent.id = slug + "Content";
	cardContent.style.display = expandedCards.includes(slug + "Content") ? "block" : "none";
	cardBody = document.createElement('div');
	cardBody.className = bodyClass;
	cardBody.innerHTML = "Loading, please wait..."
	cardContent.appendChild(cardBody);
	card.appendChild(cardContent);
	mainContent.appendChild(card);
		
	//Extra Element to Help with Card Flow
	mainContent.appendChild(document.createElement('div'));
	
	//Data loaded in seperate AJAX request
	//Do not need to check if load is necessary
}
function renderStiffCard(slug, name)
{
	card = document.createElement('div');
	card.className = "prettyBox";
	cardContent = document.createElement('div');
	cardContent.className = "prettyBoxContent";
	cardHeader = document.createElement('div');
	cardHeader.className = "weatherHeader";
	cardHeader.innerHTML = name;
	cardContent.appendChild(cardHeader);
	cardBody = document.createElement('div');
	cardBody.className = "weatherBody";
	cardBody.id = slug + "CardBody";
	cardBody.innerHTML = "Loading, please wait..."
	cardContent.appendChild(cardBody);
	card.appendChild(cardContent);
	mainContent.appendChild(card);

	//Extra Element to Help with Card Flow
	mainContent.appendChild(document.createElement('div'));
}
function renderStatsCard(slug, name)
{
	card = document.createElement('div');
	card.className = "prettyBox";
	header = document.createElement('div');
	header.className = "prettyBoxHeader";
	header.innerHTML = "<i class='fa fa-chevron-" + (expandedCards.includes(slug + "Content") ? "down" : "right") + "' aria-hidden='true'></i>" + name;
	header.addEventListener('click', showCollapseCard);
	card.appendChild(header);
	content = document.createElement('div');
	content.id = slug + "Content";
	content.className = "prettyBoxContent";
	content.innerHTML = "Loading, please wait...";
	content.style.display = expandedCards.includes(slug + "Content") ? "block" : "none";
	card.appendChild(content);
	mainContent.appendChild(card);

	//Extra Element to Help with Card Flow
	mainContent.appendChild(document.createElement('div'));
	
	//Load image, if necessary
	if(expandedCards.includes(slug + "Content")) loadStats(content);
}
function renderAlert(content, color)
{
	message = document.createElement('div');
	message.className = "prettyBox weatherAlert " + color;
	messageContent = document.createElement('div');
	messageContent.className = "prettyBoxContent";
	messageContent.innerHTML = content;
	message.appendChild(messageContent);
	
	document.getElementById('mainContent').prepend(document.createElement('div'));
	document.getElementById('mainContent').prepend(message);
}
function renderOtherEmwinContent(slug, index)
{
	//Find data
	if(/^systemEmwin/.test(slug)) thisData = responseData.system[parseInt(slug.replace("systemEmwin", ""))];
	else thisData = responseData.user[parseInt(slug.replace("userEmwin", ""))];
	
	//Build the GUI on first load
	document.getElementById(slug + 'Content').className = 'prettyBoxContent noPadding';
	target = document.getElementById(slug + 'Content').firstChild;
	
	if(target.innerHTML == "Loading, please wait...")
	{
		if(thisData.length == 0)
		{
			target.innerHTML = "<div class='prettyBoxList' style='text-align: center; font-weight: bold; font-size: 13pt;'>No Messages</div>";
			return;
		}
		
		target.innerHTML = "";
		messageHolder = document.createElement('div');
		messageHolder.id = slug + "MessageHolder";
		messageHolder.className = "prettyBoxList";
		target.appendChild(messageHolder);
		
		navigationHolder = document.createElement('div');
		navigationHolder.className = 'prettyBoxList otherEmwinNavigation';
		goBack = document.createElement('div');
		goBack.id = slug + "GoBack";
		goBack.className = 'otherEmwinNavigationArrow';
		goBack.innerHTML = "<i class='fa fa-chevron-left'></i>";
		goBack.addEventListener('click', otherEmwinNavAction);
		navigationHolder.appendChild(goBack);
		
		numIndicator = document.createElement('div');
		numIndicator.className = "otherEmwinNumIndicator";
		numIndicator.id = slug + "NumIndicator";
		navigationHolder.appendChild(numIndicator);
		
		goForward = document.createElement('div');
		goForward.id = slug + "GoForward";
		goForward.className = 'otherEmwinNavigationArrow';
		goForward.innerHTML = "<i class='fa fa-chevron-right'></i>";
		goForward.addEventListener('click', otherEmwinNavAction);
		navigationHolder.appendChild(goForward);
		target.appendChild(navigationHolder);
	}
	
	//Display the message
	document.getElementById(slug + "MessageHolder").innerHTML = thisData[index];
	document.getElementById(slug + "NumIndicator").innerHTML = "Message " + (index + 1) + " / " + thisData.length;
	
	goBack = document.getElementById(slug + "GoBack");
	goForward = document.getElementById(slug + "GoForward");
	if(index == 0) goBack.className = 'otherEmwinNavigationArrow disabled';
	else goBack.className = 'otherEmwinNavigationArrow';
	if(index == thisData.length - 1) goForward.className = 'otherEmwinNavigationArrow disabled';
	else goForward.className = 'otherEmwinNavigationArrow';
}
function otherEmwinNavAction(event)
{
	forward = /GoForward$/.test(event.currentTarget.id);
	slug = event.currentTarget.id.replace((forward ? "GoForward" : "GoBack"), '');
	if(/^systemEmwin/.test(slug)) thisData = responseData.system[parseInt(slug.replace("systemEmwin", ""))];
	else thisData = responseData.user[parseInt(slug.replace("userEmwin", ""))];
	goToMsg = parseInt(document.getElementById(slug + "NumIndicator").innerHTML.match(/^Message ([0-9]+)/)[1]) - 1 + (forward ? 1 : -1);
	if(goToMsg >= 0 && goToMsg < thisData.length) renderOtherEmwinContent(slug, goToMsg);
}
function renderAutoFilterPicklist(dataProperty)
{
	thisPicklistHolder = document.createElement('div');
	thisPicklistHolder.className = 'autoFilterPicklistHolder';
	
	thisSearchHolder = document.createElement('div');
	thisSearchHolder.className = 'autoFilterSearchHolder';
	thisSearch = document.createElement('input');
	thisSearch.type = 'text';
	thisSearch.id = dataProperty + 'Search';
	thisSearchHolder.addEventListener("input", function(event) {renderPicklistItems();});
	thisSearchHolder.appendChild(thisSearch);
	thisSearchIcon = document.createElement('i');
	thisSearchIcon.className = "fa fa-search";
	thisSearchHolder.appendChild(thisSearchIcon);
	thisPicklistHolder.appendChild(thisSearchHolder);
	
	thisPicklistBox = document.createElement('div');
	thisPicklistBox.className = 'autoFilterPicklist';
	thisPicklistBox.id = dataProperty + "Picklist";
	
	tempOption = document.createElement('div');
	tempOption.className = 'autoFilterItem';
	tempOption.innerHTML = "Loading...";
	thisPicklistBox.appendChild(tempOption);
	thisPicklistHolder.appendChild(thisPicklistBox);
	return thisPicklistHolder;
}
function renderPicklistItems(selectedProduct = null, selectedOriginator = null, selectedState = null)
{
	//Fetch pertinent informaton
	if(selectedProduct == null)
	{
		selectedProductElement = document.querySelector('#allProductsPicklist .selected');
		selectedProduct = (selectedProductElement == null ? "" : selectedProductElement.innerHTML);
	}
	if(selectedOriginator == null)
	{
		selectedOriginatorElement = document.querySelector('#allOriginatorsPicklist .selected'); 
		selectedOriginator = (selectedOriginatorElement == null ? "" : selectedOriginatorElement.innerHTML);
	}
	if(selectedState == null)
	{
		selectedStateElement = document.querySelector('#allStatesPicklist .selected');
		selectedState = (selectedStateElement == null ? "" : selectedStateElement.innerHTML);
	}
	
	allProductsSearch = document.getElementById('allProductsSearch').value;
	allOriginatorsSearch = document.getElementById('allOriginatorsSearch').value;
	allStatesSearch = document.getElementById('allStatesSearch').value;
	
	allProductsPicklist = document.getElementById('allProductsPicklist');
	allOriginatorsPicklist = document.getElementById('allOriginatorsPicklist');
	allStatesPicklist = document.getElementById('allStatesPicklist');
	
	//Break down all products
	allProducts = [];
	allOriginators = [];
	allStates = [];
	responseData['allUnique'].forEach(function(element){
		thisProduct = element.substring(0, 3);
		thisOriginator = element.substring(3, 6);
		thisState = element.substring(6);
		
		if((selectedOriginator == thisOriginator || selectedOriginator == "[Any]" || selectedOriginator == "") &&
			(selectedState == thisState || selectedState == "[Any]" || selectedState == "") &&
			(allProductsSearch == "" || thisProduct.toLowerCase().includes(allProductsSearch.toLowerCase()))) allProducts.push(thisProduct);
			
		if((selectedProduct == thisProduct || selectedProduct == "[Any]" || selectedProduct == "") &&
			(selectedState == thisState || selectedState == "[Any]" || selectedState == "") &&
			(allOriginatorsSearch == "" || thisOriginator.toLowerCase().includes(allOriginatorsSearch.toLowerCase()))) allOriginators.push(thisOriginator);
			
		if((selectedProduct == thisProduct || selectedProduct == "[Any]" || selectedProduct == "") &&
			(selectedOriginator == thisOriginator || selectedOriginator == "[Any]" || selectedOriginator == "") &&
			(allStatesSearch == "" || thisState.toLowerCase().includes(allStatesSearch.toLowerCase()))) allStates.push(thisState);
	});
	
	allProducts = [...new Set(allProducts)].sort();
	allOriginators = [...new Set(allOriginators)].sort();
	allStates = [...new Set(allStates)].sort();
	
	//Render Lists
	allProductsPicklist.innerHTML = "";
	newOption = document.createElement('div');
	newOption.className = 'autoFilterItem';
	if(selectedProduct == "[Any]") newOption.className += " selected";
	newOption.innerHTML = "[Any]";
	newOption.addEventListener('click', function(event) {
		lastSelected = event.target.parentElement.querySelector('.autoFilterItem.selected');
		if(lastSelected != null) lastSelected.className = "autoFilterItem";
		event.target.className += " selected";
		renderPicklistItems();
	});
	allProductsPicklist.appendChild(newOption);
	allProducts.forEach(function(element){
		newOption = document.createElement('div');
		newOption.className = 'autoFilterItem';
		if(selectedProduct == element) newOption.className += " selected";
		newOption.innerHTML = element;
		newOption.addEventListener('click', function(event) {
			lastSelected = event.target.parentElement.querySelector('.autoFilterItem.selected');
			if(lastSelected != null) lastSelected.className = "autoFilterItem";
			event.target.className += " selected";
			renderPicklistItems();
		});
		allProductsPicklist.appendChild(newOption);
	});
	
	allOriginatorsPicklist.innerHTML = "";
	newOption = document.createElement('div');
	newOption.className = 'autoFilterItem';
	if(selectedOriginator == "[Any]") newOption.className += " selected";
	newOption.innerHTML = "[Any]";
	newOption.addEventListener('click', function(event) {
		lastSelected = event.target.parentElement.querySelector('.autoFilterItem.selected');
		if(lastSelected != null) lastSelected.className = "autoFilterItem";
		event.target.className += " selected";
		renderPicklistItems();
	});
	allOriginatorsPicklist.appendChild(newOption);
	allOriginators.forEach(function(element){
		newOption = document.createElement('div');
		newOption.className = 'autoFilterItem';
		if(selectedOriginator == element) newOption.className += " selected";
		newOption.innerHTML = element;
		newOption.addEventListener('click', function(event) {
			lastSelected = event.target.parentElement.querySelector('.autoFilterItem.selected');
			if(lastSelected != null) lastSelected.className = "autoFilterItem";
			event.target.className += " selected";
			renderPicklistItems();
		});
		allOriginatorsPicklist.appendChild(newOption);
	});
	
	allStatesPicklist.innerHTML = "";
	newOption = document.createElement('div');
	newOption.className = 'autoFilterItem';
	if(selectedState == "[Any]") newOption.className += " selected";
	newOption.innerHTML = "[Any]";
	newOption.addEventListener('click', function(event) {
		lastSelected = event.target.parentElement.querySelector('.autoFilterItem.selected');
		if(lastSelected != null) lastSelected.className = "autoFilterItem";
		event.target.className += " selected";
		renderPicklistItems();
	});
	allStatesPicklist.appendChild(newOption);
	allStates.forEach(function(element){
		newOption = document.createElement('div');
		newOption.className = 'autoFilterItem';
		if(selectedState == element) newOption.className += " selected";
		newOption.innerHTML = element;
		newOption.addEventListener('click', function(event) {
			lastSelected = event.target.parentElement.querySelector('.autoFilterItem.selected');
			if(lastSelected != null) lastSelected.className = "autoFilterItem";
			event.target.className += " selected";
			renderPicklistItems();
		});
		allStatesPicklist.appendChild(newOption);
	});
	
	//Scroll to selected
	selectedProductElement = document.querySelector('#allProductsPicklist .selected');
	selectedOriginatorElement = document.querySelector('#allOriginatorsPicklist .selected'); 
	selectedStateElement = document.querySelector('#allStatesPicklist .selected');
	if(selectedProductElement != null && !isInView(selectedProductElement)) selectedProductElement.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' });
	if(selectedOriginatorElement != null && !isInView(selectedOriginatorElement)) selectedOriginatorElement.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' });
	if(selectedStateElement != null && !isInView(selectedStateElement)) selectedStateElement.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' });
	
	//Validate
	checkIfValidOtherEmwin();
}
function checkIfValidOtherEmwin()
{
	//Sanity Check (this may run before the DOM is complete)
	inputMethodSelector = document.querySelector('input[name="inputMethod"]:checked');
	if(inputMethodSelector == null) return;
	
	//Not all 3 selectors can be set to [All]
	isValid = true;
	if(inputMethodSelector.value == 'useBuilder')
	{
		productSelector = document.querySelector('#allProductsPicklist .selected');
		originatorSelector = document.querySelector('#allOriginatorsPicklist .selected'); 
		statesSelector = document.querySelector('#allStatesPicklist .selected');
		if(productSelector == null || originatorSelector == null || statesSelector == null) isValid = false;
		else if(productSelector.innerHTML == "[Any]" && originatorSelector.innerHTML == "[Any]" && statesSelector.innerHTML == "[Any]") isValid = false;
	}
	
	//Make sure the regex is valid
	else
	{
		selectorRegex = document.getElementById('selectorRegex').value;
		if(selectorRegex == "") isValid = false;
		else
		{
			try {new RegExp(selectorRegex);}
			catch(e) {isValid = false;}
		}
	}
	
	//Make sure the name is set
	if(document.getElementById('nameInput').value == '') isValid = false;
	
	document.getElementById('saveButton').disabled = !isValid;
}
function isInView(ele)
{
	position = ele.getBoundingClientRect();
	parentPosition = ele.parentElement.getBoundingClientRect();
	return position.top >= parentPosition.top && position.bottom <= parentPosition.bottom;
}
function renderLeftRightLine(target, tempsName, tempsValue)
{
	nameSide = document.createElement('div');
	nameSide.className = "weatherLeft";
	nameSide.innerHTML = tempsName;
	target.appendChild(nameSide);
	
	valueSide = document.createElement('div');
	valueSide.className = "weatherRight";
	valueSide.innerHTML = tempsValue;
	target.appendChild(valueSide);
	
	clearDiv = document.createElement('div');
	clearDiv.style.clear = 'both';
	target.appendChild(clearDiv);
}
function columnCalc()
{
	mainContent = document.getElementById('mainContent');
	if(mainContent.childElementCount <= 2) mainContent.className = "singleCard";
	else if(mainContent.childElementCount <= 4) mainContent.className = "dualCard";
	else mainContent.className = "mainContent";
}
function getForecastZone(orig)
{
	xhttp.getForecastZone = new XMLHttpRequest();
	xhttp.getForecastZone.onreadystatechange = function()
	{
		if(this.readyState == 4 && this.status == 200)
		{
			target = document.getElementById('wxZone');
			target.innerHTML = "";
			wxZones = JSON.parse(this.responseText);
			wxZones.forEach((wxZone) => {
				newOption = document.createElement('option');
				newOption.value = wxZone.wxZone;
				newOption.text = wxZone.wxZone + " - " + wxZone.city;
				target.appendChild(newOption);
			});
			
			target.value = currentSettings[selectedProfile].wxZone;
			delete xhttp.getForecastZone;
		}
	}

	xhttp.getForecastZone.open("GET", programPath + "dataHandler.php?type=settings&dropdown=wxZone&orig=" + orig, true);
	xhttp.getForecastZone.send();
}
function getLocations(rwrOrig)
{
	xhttp.getLocations = new XMLHttpRequest();
	xhttp.getLocations.onreadystatechange = function()
	{
		if(this.readyState == 4 && this.status == 200)
		{
			target = document.getElementById('city');
			target.innerHTML = "";
			
			cities = JSON.parse(this.responseText);
			cities.forEach((city) => {
				newOption = document.createElement('option');
				newOption.value = city;
				newOption.text = toTitleCase(city);
				target.appendChild(newOption);
			});
			
			target.value = currentSettings[selectedProfile].city;
			delete xhttp.getLocations;
		}
	}
	
	xhttp.getLocations.open("GET", programPath + "dataHandler.php?type=settings&dropdown=city&rwrOrig=" + rwrOrig, true);
	xhttp.getLocations.send();
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
function menuSelect(menuSlug)
{
	retractDrawer();
	mainContent = document.getElementById('mainContent');
	barTitle = document.getElementById('barTitle');
	
	if(window.history.state == null) window.history.replaceState({menuSlug}, '', programPath + menuSlug);
	else if(window.history.state.menuSlug != menuSlug) window.history.pushState({menuSlug}, '', programPath + menuSlug);
	
	//Do nothing if there are no valid menus (there is always at least 1 child, even with no menus)
	if(document.getElementById('sideBar').childElementCount < 2)
	{
		document.title = "Missing Config" + siteName;
		barTitle.innerHTML = "Missing Config";
		mainContent.innerHTML = "<div style='height: 30px;'></div><div class='errorMessage'><i class='fa fa-exclamation'></i><br />No data found to display! Please verify the server config</div>";
		mainContent.className = "singleCard";
		return;
	}
	
	//Select the new menu, and throw an error if it's not available
	selectedMenuElement = document.getElementById('menuItem' + selectedMenu);
	newSelectedMenuElement = document.getElementById('menuItem' + menuSlug);
	if(selectedMenuElement) selectedMenuElement.className = 'menuItem';
	if(!newSelectedMenuElement)
	{
		document.title = "Signal Lost" + siteName;
		barTitle.innerHTML = "Signal Lost";
		mainContent.innerHTML = "<div style='height: 30px;'></div><div class='errorMessage'><i class='fa fa-question-circle'></i><br />404 - Page Not Found</div>";
		mainContent.className = "singleCard";
		return;
	}
	
	document.title = newSelectedMenuElement.lastChild.innerHTML + siteName;
	newSelectedMenuElement.className = 'menuItem selected';
	if(selectedMenu != menuSlug)
	{
		selectedMenu = menuSlug;
		window.scrollTo({top: 0});
	}
	
	//Clear any remaining lightGalleries
	Object.keys(lightGalleries).forEach(thisGallery => {lightGalleries[thisGallery].destroy();});
	lightGalleries = [];
	
	//Stop any running AJAX requests
	Object.keys(xhttp).forEach(thisxhttp => {xhttp[thisxhttp].abort();});
	xhttp = [];
	
	//Load the selected menu
	switch(selectedMenu)
	{
		case 'Current-Weather':
		barTitle.innerHTML = "Current Weather";
		mainContent.innerHTML = "";
		
		renderStiffCard("currentWeather", "Current Weather");
		renderStiffCard("radarWeather", "Current Radar");
		renderStiffCard("summaryWeather", "Weather Summary");
		renderStiffCard("sevenDayWeather", "7-Day Forecast");
		renderStiffCard("forecastWeather", "Forecast");
		
		//Load Weather map
		target = document.getElementById("radarWeatherCardBody");
		if(config.localRadarVideo)
		{
			links = document.createElement('div');
			links.className = "mapLinks";
			recent = document.createElement('span');
			recent.className = "spanLink selected";
			recent.innerHTML = "Current";
			recent.id = "emwinLocalRadar-Recent";
			recent.addEventListener("click", switchRadarView);
			links.appendChild(recent);
			sevenDay = document.createElement('span');
			sevenDay.className = "spanLink";
			sevenDay.innerHTML = "Timelapse";
			sevenDay.id = "emwinLocalRadar-timelapse";
			sevenDay.addEventListener("click", switchRadarView);
			links.appendChild(sevenDay);
			target.parentElement.style.paddingBottom = 0;
			target.parentElement.appendChild(links);
		}
		
		//AJAX load weather information
		xhttp.weatherJSON = new XMLHttpRequest();
		xhttp.weatherJSON.onreadystatechange = function()
		{
			if(this.readyState != 4) return;
			if(this.status == 200)
			{
				try{responseData = JSON.parse(this.responseText);}
				catch(error)
				{
					mainContent.innerHTML = "";
					renderCollapsingCard("serverError", "The server returned bad data. Click to expand", "prettyBoxContent", "adminMessageBody");
					target = document.getElementById('serverErrorContent').firstChild;
					target.innerHTML = "";
					target.appendChild(document.createTextNode(this.responseText));
					mainContent.className = "singleCard";
					delete xhttp.weatherJSON;
					return;
				}
				
				//Weather Alert
				if(responseData.alert != "")
				{
					weatherAlert = document.createElement('div');
					weatherAlert.className = "prettyBox weatherAlert teal";
					weatherAlertContent = document.createElement('div');
					weatherAlertContent.className = "prettyBoxContent";
					weatherAlertContent.innerHTML = responseData.alert;
					weatherAlert.appendChild(weatherAlertContent);
					
					document.getElementById('mainContent').prepend(document.createElement('div'));
					document.getElementById('mainContent').prepend(weatherAlert);
				}
				
				//Render Radar Card
				target = document.getElementById("radarWeatherCardBody");
				if(responseData.localRadarMetadata.images.length == 0) removeCard(target);
				else loadLocalRadar(target, responseData.localRadarMetadata);
				
				//Render Weather Card
				target = document.getElementById("currentWeatherCardBody");
				target.previousSibling.innerHTML += " - " + toTitleCase(responseData.city) + ", " + responseData.state;
				target.innerHTML = "";
				
				if("weatherDesc" in responseData)
				{
					conditions = responseData.weatherDesc;
					switch(responseData.weatherDesc)
					{
						case "CLEAR": conditions = "Clear"; break;
						case "SUNNY": conditions = "Sunny"; break;
						case "PTSUNNY": conditions = "Partly Sunny"; break;
						case "MOSUNNY": conditions = "Mostly Sunny"; break;
						case "MOSUNNY": conditions = "Mostly Sunny"; break;
						case "PTCLDY": conditions = "Partly Cloudy"; break;
						case "MOCLDY": conditions = "Mostly Cloudy"; break;
						case "CLOUDY": conditions = "Cloudy"; break;
						case "HAZE": conditions = "Haze"; break;
						case "MIX PCPN": conditions = "Winter Mix"; break;
						case "LGT SNOW": conditions = "Light Snow"; break;
						case "LGT RAIN": conditions = "Light Rain"; break;
						case "RAIN": conditions = "Rain"; break;
						case "HVY RAIN": conditions = "Heavy Rain"; break;
						case "HVY SNOW": conditions = "Heavy Snow"; break;
						case "FRZ RAIN": conditions = "Freezing Rain"; break;
						case "DRIZZLE": conditions = "Drizzle"; break;
						case "SNOW": conditions = "Snow"; break;
						case "FLURRIES": conditions = "Flurries"; break;
						case "FAIR": conditions = "Fair"; break;
						case "FOG": conditions = "Fog"; break;
						case "TSTM": conditions = "Thunderstorms"; break;
					}
					renderLeftRightLine(target, "Weather", conditions);
				}
				
				if("temp" in responseData) renderLeftRightLine(target, "Temperature", responseData.temp + "&deg; F");
				if("humidity" in responseData) renderLeftRightLine(target, "Humidity", responseData.humidity + "%");
				if("dewPoint" in responseData) renderLeftRightLine(target, "Dew Point", responseData.dewPoint + "&deg; F");
				if("pressure" in responseData) renderLeftRightLine(target, "Barometric Pressure", responseData.pressure);
				if("wind" in responseData && "windDirection" in responseData) renderLeftRightLine(target, "Wind", (responseData.wind == 0 ? "Calm" : responseData.windDirection + ", " + responseData.wind + " MPH"));
				if("windGust" in responseData && responseData.windGust != "N/A") renderLeftRightLine(target, "Wind Gust", responseData.windGust);
				if("remarks" in responseData && responseData.remarks != "") renderLeftRightLine(target, "Remarks", responseData.remarks);
				
				if(target.innerHTML == "") removeCard(target);
				else target.innerHTML += "<div class='goeslabel'>Last Update: " + responseData.weatherTime + "</div>";
				
				//Weather Summary
				target = document.getElementById("summaryWeatherCardBody");
				if(responseData.summary == "") removeCard(target);
				else document.getElementById("summaryWeatherCardBody").innerHTML = responseData.summary + "<div class='goeslabel'>Last Update: " + responseData.summaryTime + "</div>";
				
				//7 day forcast
				target = document.getElementById("sevenDayWeatherCardBody");
				if(responseData.sevenDayForcast.length == 0) removeCard(target);
				else
				{
					target.innerHTML = "";
					sevenDayForcastContainer = document.createElement('div');
					sevenDayForcastContainer.className = "forcastCardHolder";
					
					responseData.sevenDayForcast.forEach(todaysForcast => {
						forcastCard = document.createElement('div');
						forcastCard.className = 'forecastCard';
						forcastCard.innerHTML = "<div class='forecastHeader'>" + todaysForcast.date + "</div>";
						
						if("amClouds" in todaysForcast && "amPrecip" in todaysForcast)
						{
							//Probably not raining
							if(todaysForcast.amClouds == "CL" || todaysForcast.amClouds == "FW") forcastCard.innerHTML += "<i class='fa fa-sun fa-4x'></i><br />";
							else if(todaysForcast.amClouds == "SC" || todaysForcast.amClouds == "B1")
							{
								if(todaysForcast.amPrecip < 50) forcastCard.innerHTML += "<i class='fa fa-cloud-sun fa-4x'></i><br />";
								else forcastCard.innerHTML += "<i class='fa fa-cloud-sun-rain fa-4x'></i><br />";
							}
							else if(todaysForcast.amClouds == "B2" || todaysForcast.amClouds == "OV")
							{
								if(todaysForcast.amPrecip < 50) forcastCard.innerHTML += "<i class='fa fa-cloud fa-4x'></i><br />";
								else forcastCard.innerHTML += "<i class='fa fa-cloud-showers-heavy fa-4x'></i><br />";
							}
							else forcastCard.innerHTML += "<i class='fa fa-question-circle fa-4x'></i><br />";
							
							forcastCard.innerHTML += "<div style='height: 10px;'></div>";
						}
						
						if("maxTemp" in todaysForcast) renderLeftRightLine(forcastCard, "High", todaysForcast.maxTemp + "&deg; F");
						if("amPrecip" in todaysForcast) renderLeftRightLine(forcastCard, "Precipitation", todaysForcast.amPrecip + "%");
						if("amHumidity" in todaysForcast) renderLeftRightLine(forcastCard, "Humidity", todaysForcast.amHumidity + "%");
						
						if((("amClouds" in todaysForcast && "amPrecip" in todaysForcast) || "maxTemp" in todaysForcast || "amPrecip" in todaysForcast || "amHumidity" in todaysForcast) && (("pmClouds" in todaysForcast && "pmPrecip" in todaysForcast) || "minTemp" in todaysForcast || "pmPrecip" in todaysForcast || "pmHumidity" in todaysForcast)) forcastCard.innerHTML += "<div class='forecastHeader' style='margin-top: 25px;'>Evening</div>";
						if("pmClouds" in todaysForcast && "pmPrecip" in todaysForcast)
						{
							//Probably not raining
							if(todaysForcast.pmClouds == "CL" || todaysForcast.pmClouds == "FW") forcastCard.innerHTML += "<i class='fa fa-moon fa-4x'></i><br />";
							else if(todaysForcast.pmClouds == "SC" || todaysForcast.pmClouds == "B1")
							{
								if(todaysForcast.pmPrecip < 50) forcastCard.innerHTML += "<i class='fa fa-cloud-moon fa-4x'></i><br />";
								else forcastCard.innerHTML += "<i class='fa fa-cloud-moon-rain fa-4x'></i><br />";
							}
							else if(todaysForcast.pmClouds == "B2" || todaysForcast.pmClouds == "OV")
							{
								if(todaysForcast.pmPrecip < 50) forcastCard.innerHTML += "<i class='fa fa-cloud fa-4x'></i><br />";
								else forcastCard.innerHTML += "<i class='fa fa-cloud-showers-heavy fa-4x'></i><br />";
							}
							else forcastCard.innerHTML += "<i class='fa fa-question-circle fa-4x'></i><br />";
							
							forcastCard.innerHTML += "<div style='height: 10px;'></div>";
						}
						
						if("minTemp" in todaysForcast) renderLeftRightLine(forcastCard, "Low", todaysForcast.minTemp + "&deg; F");
						if("pmPrecip" in todaysForcast) renderLeftRightLine(forcastCard, "Precipitation", todaysForcast.pmPrecip + "%");
						if("pmHumidity" in todaysForcast) renderLeftRightLine(forcastCard, "Humidity", todaysForcast.pmHumidity + "%");
						
						sevenDayForcastContainer.appendChild(forcastCard);
					});
					
					target.appendChild(sevenDayForcastContainer);
					
					sevenDayForecastLastUpdate = document.createElement('div');
					sevenDayForecastLastUpdate.className = "goeslabel";
					sevenDayForecastLastUpdate.innerHTML = "Last Update: " + responseData.sevenDayForecastDate;
					target.appendChild(sevenDayForecastLastUpdate);
				}
				
				
				//Forecast
				target = document.getElementById("forecastWeatherCardBody");
				if(responseData.forecast.length == 0) removeCard(target);
				else
				{
					target.previousSibling.innerHTML += " - " + toTitleCase(responseData.city) + ", " + responseData.state;
					target.innerHTML = "";
					Object.keys(responseData.forecast).forEach((key) => {target.innerHTML += "<p><b>" + key + ": </b>" + responseData.forecast[key] + "</p>";});
					target.innerHTML += "<div class='goeslabel'>Last Update: " + responseData.forecastTime + "</div>";
				}
			}
			else
			{
				mainContent.innerHTML = "";
				renderStiffCard("serverError", "The server returned error " + this.status);
				targetedContent = document.getElementById('serverErrorCardBody');
				targetedContent.style.textAlign = 'center';
				targetedContent.innerHTML = this.statusText;
				mainContent.className = "singleCard";
			}
			
			delete xhttp.weatherJSON;
			columnCalc();
		}
		
		xhttp.weatherJSON.open("GET", programPath + "dataHandler.php?type=weatherJSON", true);
		xhttp.weatherJSON.send();
		
		//AJAX load alerts
		xhttp.alertJSON = new XMLHttpRequest();
		xhttp.alertJSON.onreadystatechange = function()
		{
			if(this.readyState != 4) return;
			if(this.status == 200)
			{
				try{alertInfo = JSON.parse(this.responseText);}
				catch(error)
				{
					renderAlert("The server returned bad alert data: <br /><br />" + this.responseText, "red");
					delete xhttp.alertJSON;
					return;
				}
				
				//Weather Warnings
				alertInfo.weatherWarnings.forEach(function(element){renderAlert(element, "red")});
				alertInfo.hurricaneStatement.forEach(function(element){renderAlert(element, "red")});
				alertInfo.localEvacuations.forEach(function(element){renderAlert(element, "brown")});
				alertInfo.localEmergencies.forEach(function(element){renderAlert(element, "red")});
				alertInfo.blueAlerts.forEach(function(element){renderAlert(element, "blue")});
				alertInfo.amberAlerts.forEach(function(element){renderAlert(element, "amber")});
				alertInfo.civilDangerWarnings.forEach(function(element){renderAlert(element, "purple")});
				alertInfo.spaceWeatherAlerts.forEach(function(element){renderAlert(element, "blue")});
			}
			
			else renderAlert("The server returned status code " + this.statusText + " (" + this.statusText + ") when trying to load weather alerts", "red");
			delete xhttp.alertJSON;
			columnCalc();
		}
		xhttp.alertJSON.open("GET", programPath + "dataHandler.php?type=alertJSON", true);
		xhttp.alertJSON.send();
		break;
		
		case 'Other-EMWIN':
		barTitle.innerHTML = "Other EMWIN";
		mainContent.innerHTML = "";
		
		if(config.allowUserLoader)
		{
			renderCollapsingCard("emwinLoader", "Load Additional Data", "prettyBoxContent", "weatherBody");
			document.getElementById('emwinLoaderContent').parentElement.className += " emwinLoader";
			target = document.getElementById('emwinLoaderContent').firstChild;
			target.innerHTML = "";
			
			selectorSection = document.createElement('div');
			selectorSection.className = 'prettyBoxList';
			selectorSection.style.padding = 0;
			selectorSection.style.paddingBottom = "10px";
			
			radioButton = document.createElement('input');
			radioButton.type = 'radio';
			radioButton.name = 'inputMethod';
			radioButton.id = 'useBuilder';
			radioButton.value = 'useBuilder';
			radioButton.checked = true;
			radioButton.addEventListener('click', function(){
				document.getElementById('selectorRegex').disabled = true;
				document.getElementById('autoFilterFlex').className = 'autoFilterFlex';
				checkIfValidOtherEmwin();
			});
			
			selectorSection.appendChild(radioButton);
			buttonLabel = document.createElement('label');
			buttonLabel.htmlFor = 'useBuilder';
			buttonLabel.innerHTML = "Automatic Data Selector";
			selectorSection.appendChild(buttonLabel);
			
			autoFilterFlex = document.createElement('div');
			autoFilterFlex.id = 'autoFilterFlex';
			autoFilterFlex.className = 'autoFilterFlex';
			
			productFilter = document.createElement('div');
			productFilter.className = 'autoFilterCategory';
			productFilter.innerHTML = "Product";
			productFilter.appendChild(renderAutoFilterPicklist("allProducts"));
			autoFilterFlex.appendChild(productFilter);
			
			originatorFilter = document.createElement('div');
			originatorFilter.className = 'autoFilterCategory';
			originatorFilter.innerHTML = "Originator";
			originatorFilter.appendChild(renderAutoFilterPicklist("allOriginators"));
			autoFilterFlex.appendChild(originatorFilter);

			stateFilter = document.createElement('div');
			stateFilter.className = 'autoFilterCategory';
			stateFilter.innerHTML = "State";
			stateFilter.appendChild(renderAutoFilterPicklist("allStates"));
			autoFilterFlex.appendChild(stateFilter);
			selectorSection.appendChild(autoFilterFlex);
			
			regexFlex = document.createElement('div');
			regexFlex.className = 'inputFlex';
			radioButton = document.createElement('input');
			radioButton.type = 'radio';
			radioButton.name = 'inputMethod';
			radioButton.id = 'manualRegex';
			radioButton.value = 'manualRegex';
			radioButton.addEventListener('click', function(){
				document.getElementById('selectorRegex').disabled = false;
				document.getElementById('autoFilterFlex').className = 'autoFilterFlex disabled';
				checkIfValidOtherEmwin();
			});
			
			regexFlex.appendChild(radioButton);
			buttonLabel = document.createElement('label');
			buttonLabel.htmlFor = 'manualRegex';
			buttonLabel.innerHTML = "Manual Data Selector";
			regexFlex.appendChild(buttonLabel);
			
			selectorRegex = document.createElement('input');
			selectorRegex.type = 'text';
			selectorRegex.id = 'selectorRegex';
			selectorRegex.disabled = true;
			selectorRegex.addEventListener('input', function() {checkIfValidOtherEmwin();} );
			regexFlex.appendChild(selectorRegex);
			selectorSection.appendChild(regexFlex);
			target.appendChild(selectorSection);
			
			nameSection = document.createElement('div');
			nameSection.className = 'prettyBoxList';
			nameSection.style.padding = 0;
			nameSection.style.paddingBottom = "10px";
			
			nameFlex = document.createElement('div');
			nameFlex.className = 'inputFlex';
			nameLabel = document.createElement('label');
			nameLabel.htmlFor = 'nameInput';
			nameLabel.innerHTML = "Display Name:";
			nameFlex.appendChild(nameLabel);
			
			nameInput = document.createElement('input');
			nameInput.type = 'text';
			nameInput.id = 'nameInput';
			nameInput.addEventListener('input', function() {checkIfValidOtherEmwin();} );
			nameFlex.appendChild(nameInput);
			nameSection.appendChild(nameFlex);
			
			truncLabel = document.createElement('div');
			truncLabel.className = 'truncLeft';
			truncLabel.innerHTML = "Lines to remove from beginning:";
			nameSection.appendChild(truncLabel);
			
			truncInput = document.createElement('input');
			truncInput.type = 'number';
			truncInput.style.width = '3em';
			truncInput.style.textAlign = 'left';
			truncInput.value = 0;
			truncInput.pattern = '\d*';
			truncInput.inputMode = 'numeric';
			truncInput.min = 0;
			truncInput.max = 10;
			truncInput.id = 'truncInput';
			truncInput.className = 'weatherRight';
			nameSection.appendChild(truncInput);
			
			clearDiv = document.createElement('div');
			clearDiv.style.clear = 'both';
			nameSection.appendChild(clearDiv);
			target.appendChild(nameSection);
			
			settingsSetion = document.createElement('div');
			settingsSetion.className = 'prettyBoxList';
			settingsSetion.style.padding = 0;
			settingsSetion.style.paddingBottom = "10px";
			
			formatHeader = document.createElement('div');
			formatHeader.innerHTML = "Text File Type";
			formatHeader.style.fontWeight = 'bold';
			settingsSetion.appendChild(formatHeader);
			
			preOptFlex = document.createElement('div');
			preOptFlex.className = 'fileTypeRow';
			preOptRadio = document.createElement('input');
			preOptRadio.type = 'radio';
			preOptRadio.name = 'formatMethod';
			preOptRadio.id = 'preOptRadio';
			preOptRadio.checked = true;
			preOptRadio.value = 'formatted';

			preOptFlex.appendChild(preOptRadio);
			preOptLabel = document.createElement('label');
			preOptLabel.htmlFor = 'preOptRadio';
			preOptLabel.innerHTML = "<b>Pre-formatted: </b> The data contains tables or other pre-formatted data that does not convert nicely into paragraphs";
			preOptFlex.appendChild(preOptLabel);
			settingsSetion.appendChild(preOptFlex);
			
			paraOptFlex = document.createElement('div');
			paraOptFlex.className = 'fileTypeRow';
			paraOptRadio = document.createElement('input');
			paraOptRadio.type = 'radio';
			paraOptRadio.name = 'formatMethod';
			paraOptRadio.id = 'paraOptRadio';
			paraOptRadio.value = 'paragraph';

			paraOptFlex.appendChild(paraOptRadio);
			paraOptLabel = document.createElement('label');
			paraOptLabel.htmlFor = 'paraOptRadio';
			paraOptLabel.innerHTML = "<b>Paragraph: </b> the data consists of sentences that can be converted easily into paragraph form";
			paraOptFlex.appendChild(paraOptLabel);
			settingsSetion.appendChild(paraOptFlex);
			target.appendChild(settingsSetion);
			
			saveButtonSection = document.createElement('div');
			saveButtonSection.className = 'prettyBoxList';
			saveButtonSection.style.padding = 0;
			saveButtonSection.style.marginBottom = 0;
			saveButtonSection.style.textAlign = 'center';
			saveButton = document.createElement('input');
			saveButton.type = 'button';
			saveButton.id = 'saveButton';
			saveButton.style.fontWeight = 'bold';
			saveButton.value = "Save";
			saveButton.disabled = true;
			saveButton.style.width = "100%";
			saveButton.addEventListener('click', function() {
				//Get Regex
				inputMethodSelector = document.querySelector('input[name="inputMethod"]:checked');
				if(inputMethodSelector.value == 'useBuilder')
				{
					productSelector = document.querySelector('#allProductsPicklist .selected').innerHTML;
					originatorSelector = document.querySelector('#allOriginatorsPicklist .selected').innerHTML; 
					statesSelector = document.querySelector('#allStatesPicklist .selected').innerHTML;
					identifier = "(" + (productSelector == "[Any]" ? "[A-Z0-9]{3}" : productSelector) + ")" +
						"(" + (originatorSelector == "[Any]" ? "[A-Z0-9]{3}" : originatorSelector) + ")" +
						"(" + (statesSelector == "[Any]" ? "[A-Z0-9]{2}" : statesSelector) + ")";
				}
				else identifier = document.getElementById('selectorRegex').value;
				
				//Get title, Lines to truncate, and format
				title = document.getElementById('nameInput').value.replace(/!/g, "").replace(/~/g, "");
				format = document.querySelector('input[name="formatMethod"]:checked').value;
				truncate = document.getElementById('truncInput').value;
				
				//Check if we're editing a previous entry
				cardHeader = document.getElementById('emwinLoaderContent').previousSibling.lastChild.data;
				if(cardHeader != "Load Additional Data")
				{
					config.otherEmwin.user[parseInt(cardHeader.split("#")[1]) - 1] = {
						'identifier': identifier,
						'title': title,
						'format': format,
						'truncate': truncate
					};
				}
				else
				{
					config.otherEmwin.user.push({
						'identifier': identifier,
						'title': title,
						'format': format,
						'truncate': truncate
					});
				}
				
				setCookie("otheremwin", encodeOtherEmwinConfig(config.otherEmwin.user));
				location.reload();
			});
			saveButtonSection.appendChild(saveButton);
			target.appendChild(saveButtonSection);
		
			//User EMWIN Data
			cardNum = 0;
			config.otherEmwin.user.forEach(function(element){
				renderCollapsingCard("userEmwin" + cardNum, element.title, "prettyBoxContent", (element.format == 'paragraph' ? "weatherBody" : "emwinMessageBody"));
				deleteHolder = document.createElement('div');
				deleteHolder.className = 'otherEmwinDeleteHolder';
				
				editButton = document.createElement('i');
				editButton.className = 'far fa-edit';
				editButton.title = "Edit this card's settings";
				editButton.addEventListener('click', function(event){
					editorCard = document.getElementById('emwinLoaderContent');
					target = parseInt(event.target.parentElement.parentElement.nextSibling.id.replace('userEmwin', '').replace('Content', ''));
					editorCard.parentElement.className += " highlighted";
					editorCard.previousSibling.lastChild.data = "Editing Additional Card #" + (target + 1);
					document.getElementById('saveButton').value = "Update \"" + config.otherEmwin.user[target].title + "\"";
					if(editorCard.style.display == 'none') editorCard.previousSibling.click();
					
					document.getElementById('nameInput').value = config.otherEmwin.user[target].title;
					document.getElementById('truncInput').value = config.otherEmwin.user[target].truncate;
					document.getElementById('allProductsSearch').value = '';
					document.getElementById('allOriginatorsSearch').value = '';
					document.getElementById('allStatesSearch').value = '';
					document.getElementById(config.otherEmwin.user[target].format == "paragraph" ? "paraOptRadio" : "preOptRadio").checked = true;
					
					identifierParts = /^\(([A-Z0-9]{3}|\[A-Z0-9\]\{3\})\)\(([A-Z0-9]{3}|\[A-Z0-9\]\{3\})\)\(([A-Z0-9]{2}|\[A-Z0-9\]\{2\})\)$/.exec(config.otherEmwin.user[target].identifier);
					if(identifierParts != null)
					{
						document.getElementById('useBuilder').click();
						thisProduct = (identifierParts[1] == "[A-Z0-9]{3}" ? "[Any]" : identifierParts[1]);
						thisOriginator = (identifierParts[2] == "[A-Z0-9]{3}" ? "[Any]" : identifierParts[2]);
						thisState = (identifierParts[3] == "[A-Z0-9]{2}" ? "[Any]" : identifierParts[3]);
						renderPicklistItems(thisProduct, thisOriginator, thisState);
					}
					else
					{
						document.getElementById('manualRegex').click();
						document.getElementById('selectorRegex').value = config.otherEmwin.user[target].identifier;
					}
					
					window.scrollTo(0, 0);
					event.stopPropagation();
				});
				deleteHolder.appendChild(editButton);
				
				deleteButton = document.createElement('i');
				deleteButton.className = 'fa fa-trash-alt';
				deleteButton.title = "Remove this card";
				deleteButton.addEventListener('click', function(event){
					target = parseInt(event.target.parentElement.parentElement.nextSibling.id.replace('userEmwin', '').replace('Content', ''));
					
					if(confirm("Are you sure you want to delete the card for \"" + config.otherEmwin.user[target].title + "\"?"))
					{
						config.otherEmwin.user.splice(target, 1);
						setCookie("otheremwin", encodeOtherEmwinConfig(config.otherEmwin.user));
						location.reload();
					}
					event.stopPropagation();
				});
				deleteHolder.appendChild(deleteButton);
				
				document.getElementById("userEmwin" + cardNum + "Content").previousSibling.appendChild(deleteHolder);
				cardNum++;
			});
			
		}
		if(config.showEmwinInfo)
		{
			//System EMWIN Data
			cardNum = 0;
			config.otherEmwin.system.forEach(function(element){
				renderCollapsingCard("systemEmwin" + cardNum, element.title, "prettyBoxContent", (element.format == 'paragraph' ? "weatherBody" : "emwinMessageBody"));
				cardNum++;
			});
			
			//Hard-coded cards
			renderCollapsingCard("satelliteTle", "Weather Satellite TLE", "prettyBoxContent", "weatherBody");
			renderCollapsingCard("emwinLicense", "EMWIN Licensing Info", "prettyBoxContent", "weatherBody");
		}
		if(config.showAdminInfo) renderCollapsingCard("adminMessage", "Latest Admin Message", "prettyBoxContent", "adminMessageBody");
		
		xhttp.otherEMWIN = new XMLHttpRequest();
		xhttp.otherEMWIN.onreadystatechange = function()
		{
			if(this.readyState != 4) return;
			if(this.status == 200)
			{
				try{responseData = JSON.parse(this.responseText);}
				catch(error)
				{
					mainContent.innerHTML = "";
					renderCollapsingCard("serverError", "The server returned bad data. Click to expand", "prettyBoxContent", "adminMessageBody");
					target = document.getElementById('serverErrorContent').firstChild;
					target.innerHTML = "";
					target.appendChild(document.createTextNode(this.responseText));
					mainContent.className = "singleCard";
					delete xhttp.otherEMWIN;
					return;
				}
				
				if(config.allowUserLoader)
				{
					//Additional Data Loader
					renderPicklistItems("[Any]", "[Any]", "[Any]");
					
					//Show error if too much data is loaded
					if(responseData.numUserFiles > responseData.maxUserFiles && responseData.maxUserFiles != 0)
						renderAlert("<p style='font-weight: bold;'>Warning</p><p>You have attempted to load too much additional data from this browser. \
							Either reduce the amount of data requested, increase the 'maxUserFiles' option in config.ini, or configure addtional data in your server config.</p> \
							<p>No additional data will be loaded until this issue is resolved.</p> \
							<p><b>Total Requested: </b>" + responseData.numUserFiles + "<br /><b>Max Allowed: </b>" + responseData.maxUserFiles + "</p>", "red");
					
					//User-Defined Data
					cardNum = 0;
					responseData.user.forEach(function(element){
						renderOtherEmwinContent('userEmwin' + cardNum, element.length - 1);
						cardNum++;
					});
				}
				
				if(config.showEmwinInfo)
				{
					//System-defined data
					cardNum = 0;
					responseData.system.forEach(function(element){
						renderOtherEmwinContent('systemEmwin' + cardNum, element.length - 1);
						cardNum++;
					});
					
					//Weather Satellite TLE
					target = document.getElementById('satelliteTleContent').firstChild;
					if(responseData.satelliteTle.length == 0) target.innerHTML = "<div style='text-align: center; font-weight: bold; font-size: 13pt;'>Satellite TLEs are currently unavailable</div>";
					else
					{
						target.innerHTML = "<p style='font-weight: bold;'>TLEs for the following satellites are available from GOES</p>";
						responseData.satelliteTle.forEach((element) => {
							newSatellite = document.createElement('div');
							newSatellite.style.width = 'calc(49% - 10px)';
							newSatellite.style.display = 'inline-block';
							newSatellite.style.verticalAlign = 'top';
							newSatellite.style.marginRight = '5px';
							newSatellite.style.marginBottom = '5px';
							newSatellite.innerHTML = "&#8226; " + element;
							target.appendChild(newSatellite);
						});
						
						downloadButtonHolder = document.createElement('div');
						downloadButtonHolder.style.textAlign = 'center';
						downloadButton = document.createElement('input');
						downloadButton.type = 'button';
						downloadButton.value = "Download TLE";
						downloadButton.style.width = "50%";
						downloadButton.style.minWidth = "120px";
						downloadButton.style.marginBottom = "5px";
						downloadButton.addEventListener('click', function(){
							window.location = programPath + 'dataHandler.php?type=tle';
						});
						downloadButtonHolder.appendChild(downloadButton);
						target.appendChild(downloadButtonHolder);
						
						satelliteTleLastUpdate = document.createElement('div');
						satelliteTleLastUpdate.className = "goeslabel";
						satelliteTleLastUpdate.innerHTML = "Last Broadcast: " + responseData.satelliteTleDate;
						target.parentElement.appendChild(satelliteTleLastUpdate);
					}
					
					//EMWIN Licensing Info
					target = document.getElementById('emwinLicenseContent').firstChild;
					target.innerHTML = responseData.emwinLicense;
					
					adminMessageLastUpdate = document.createElement('div');
					adminMessageLastUpdate.className = "goeslabel";
					adminMessageLastUpdate.innerHTML = "Last Broadcast: " + responseData.emwinLicenseDate;
					target.parentElement.appendChild(adminMessageLastUpdate);
				}
				
				if(config.showAdminInfo)
				{
					//Latest Admin message
					target = document.getElementById('adminMessageContent').firstChild;
					target.innerHTML = responseData.latestAdmin;
					
					adminMessageLastUpdate = document.createElement('div');
					adminMessageLastUpdate.className = "goeslabel";
					adminMessageLastUpdate.innerHTML = "Last Updated: " + responseData.latestAdminDate;
					target.parentElement.appendChild(adminMessageLastUpdate);
				}
			}
			else
			{
				mainContent.innerHTML = "";
				renderStiffCard("serverError", "The server returned error " + this.status);
				targetedContent = document.getElementById('serverErrorCardBody');
				targetedContent.style.textAlign = 'center';
				targetedContent.innerHTML = this.statusText;
				mainContent.className = "singleCard";
			}
			
			delete xhttp.otherEMWIN;
		}
		xhttp.otherEMWIN.open("GET", programPath + "dataHandler.php?type=metadata&id=otherEmwin", true);
		xhttp.otherEMWIN.send();
		break;
		
		case 'Hurricane-Center':
		barTitle.innerHTML = "Hurricane Center";
		mainContent.innerHTML = "";
		renderStiffCard("loadingNotice", "Hurricane Info");
		
		xhttp.hurricaneInfo = new XMLHttpRequest();
		xhttp.hurricaneInfo.onreadystatechange = function()
		{
			if(this.readyState != 4) return;
			if(this.status == 200)
			{
				try{responseData = JSON.parse(this.responseText);}
				catch(error)
				{
					target = document.getElementById('loadingNoticeCardBody');
					target.innerHTML = "";
					target.appendChild(document.createTextNode("The server returned bad data:" + this.responseText));
					target.className += " adminMessageBody";
					
					delete xhttp.hurricaneInfo;
					return;
				}
				
				if(Object.keys(responseData).length == 0)
				{
					document.getElementById('loadingNoticeCardBody').innerHTML = "<div style='text-align: center;'>No tropical activity at this time</div>";
				}
				else
				{
					mainContent.innerHTML = "";
					Object.keys(responseData).forEach(thisHurricane => {
						renderCollapsingCard(thisHurricane, responseData[thisHurricane].title, "prettyBoxContent noPadding", "weatherBody");
						thisCardBody = document.getElementById(thisHurricane + "Content").firstChild;
						thisCardBody.innerHTML = "";
						
						//Display advisory information if we have it
						if("latestAdvisory" in responseData[thisHurricane])
						{
							advisoryItem = document.createElement('div');
							advisoryItem.className = 'prettyBoxList';

							if("latestAdvTime" in responseData[thisHurricane]) renderLeftRightLine(advisoryItem, "Advisory Time", responseData[thisHurricane].latestAdvTime);
							renderLeftRightLine(advisoryItem, "Advisory Number", responseData[thisHurricane].latestAdvisory);
							if("position" in responseData[thisHurricane]) renderLeftRightLine(advisoryItem, "Position", responseData[thisHurricane].position);
							if("movement" in responseData[thisHurricane]) renderLeftRightLine(advisoryItem, "Moving", responseData[thisHurricane].movement);
							if("pressure" in responseData[thisHurricane]) renderLeftRightLine(advisoryItem, "Pressure", responseData[thisHurricane].pressure);
							if("maxWind" in responseData[thisHurricane]) renderLeftRightLine(advisoryItem, "Max Winds", responseData[thisHurricane].maxWind);
							if("status" in responseData[thisHurricane]) renderLeftRightLine(advisoryItem, "Status", responseData[thisHurricane].status);
							if("nextMessage" in responseData[thisHurricane]) renderLeftRightLine(advisoryItem, "Next Message", responseData[thisHurricane].nextMessage);
							
							thisCardBody.appendChild(advisoryItem);
						}
						
						//RS images
						if("RS" in responseData[thisHurricane])
						{
							rsItem = document.createElement('div');
							rsItem.className = 'prettyBoxList';
							thisCardBody.appendChild(rsItem);
							loadHurricane(rsItem, "RS", thisHurricane, responseData[thisHurricane].title, responseData[thisHurricane].RS);
						}
						
						//WS images
						if("WS" in responseData[thisHurricane])
						{
							wsItem = document.createElement('div');
							wsItem.className = 'prettyBoxList';
							thisCardBody.appendChild(wsItem);
							loadHurricane(wsItem, "WS", thisHurricane, responseData[thisHurricane].title, responseData[thisHurricane].WS);
						}
						
						//5D images
						if("5D" in responseData[thisHurricane])
						{
							fdItem = document.createElement('div');
							fdItem.className = 'prettyBoxList';
							fdItem.style.paddingTop = "5px";
							loadHurricane(fdItem, "5D", thisHurricane, responseData[thisHurricane].title, responseData[thisHurricane]["5D"]);
							
							fdHeader = document.createElement('div');
							fdHeader.className = 'hurricaneForecastHeader';
							fdHeader.innerHTML = "5-Day Forecast"
							fdItem.prepend(fdHeader);
							
							thisCardBody.appendChild(fdItem);
						}
					});
					
					columnCalc();
				}
			}
			else
			{
				target = document.getElementById('loadingNoticeCardBody');
				target.style.textAlign = "center";
				target.innerHTML = "The server returned error code " + this.status + " (" + this.statusText + ")";
			}
			
			delete xhttp.hurricaneInfo;
		}
		xhttp.hurricaneInfo.open("GET", programPath + "dataHandler.php?type=hurricaneJSON", true);
		xhttp.hurricaneInfo.send();
		break;
		
		case 'Local-Settings':
		barTitle.innerHTML = "Local Settings";
		mainContent.innerHTML = "";
		
		//Render main cards
		if(config.showEmwinInfo) renderStiffCard("selectedProfile", "Location Settings Profile");
		renderStiffCard("selectedTheme", "Web App Theme");
		
		if(config.showEmwinInfo)
		{
			//Set up profile
			selectedProfile = parseInt(getCookie('selectedProfile'));
			currentSettings = decodeProfile(getCookie('localSettings'));
			profileSelectorHolder = document.createElement('div');
			profileSelectorHolder.className = 'prettyBoxList profileSelector';
			profileSelectorHolder.innerHTML = "<span style='font-weight: bold;'>Profile: </span>";
			
			profileSelector = document.createElement('select');
			profileSelector.id = 'profileSelector';
			profileSelector.style.minWidth = "30px";
			thisProfile = 0;
			currentSettings.forEach(profile => {
				newOption = document.createElement('option');
				newOption.value = thisProfile;
				newOption.text = (thisProfile == 0 ? "Ground Station Defaults" : (profile.city == "" ? profile.wxZone : toTitleCase(profile.city)) + ", " + profile.stateAbbr);
				profileSelector.appendChild(newOption);
				thisProfile++;
			});
			profileSelector.selectedIndex = selectedProfile;
			profileSelector.addEventListener('change', function(evt) {
				lastRadarCode = currentSettings[selectedProfile].radarCode;
				
				selectedProfile = document.getElementById('profileSelector').selectedIndex;
				setCookie('selectedProfile', selectedProfile);
				
				if(currentSettings[selectedProfile].radarCode != lastRadarCode) location.reload();
				else menuSelect(selectedMenu);
			});
			profileSelectorHolder.appendChild(profileSelector);
			
			addNewButton = document.createElement('input');
			addNewButton.id = "addNewButton";
			addNewButton.type = "button";
			addNewButton.value = "Add";
			addNewButton.disabled = (currentSettings.length >= 10);
			addNewButton.addEventListener('click', function() {
				currentSettings.push(currentSettings[selectedProfile]);
				setCookie("localSettings", encodeProfile(currentSettings));
				setCookie("selectedProfile", currentSettings.length - 1);
				menuSelect(selectedMenu);
			});
			profileSelectorHolder.appendChild(addNewButton);
			
			deleteButton = document.createElement('input');
			deleteButton.id = "deleteButton";
			deleteButton.type = "button";
			deleteButton.value = "Delete";
			deleteButton.style.color = "red";
			deleteButton.addEventListener('click', function() {
				lastRadarCode = currentSettings[selectedProfile].radarCode;
				
				currentSettings.splice(selectedProfile, 1);
				selectedProfile = 0;
				
				setCookie("localSettings", encodeProfile(currentSettings));
				setCookie("selectedProfile", selectedProfile);
				
				if(currentSettings[selectedProfile].radarCode != lastRadarCode) location.reload();
				else menuSelect(selectedMenu);
			});
			profileSelectorHolder.appendChild(deleteButton);
			
			target = document.getElementById('selectedProfileCardBody');
			target.innerHTML = "";
			target.appendChild(profileSelectorHolder);
			
			generalSettingsHolder = document.createElement('div');
			generalSettingsHolder.className = 'prettyBoxList';
			generalSettingsHolder.style.padding = 0;
			generalSettingsHolder.style.paddingBottom = "10px";
			renderLeftRightLine(generalSettingsHolder, "Timezone", "<select id='timezone'></select>");
			renderLeftRightLine(generalSettingsHolder, "Radar Code", "<select id='radarCode'></select>");
			renderLeftRightLine(generalSettingsHolder, "State/Territory", "<select id='stateAbbr'></select>");
			renderLeftRightLine(generalSettingsHolder, "Latitude", "<input style='width: 40px;' type='text' id='lat' />");
			renderLeftRightLine(generalSettingsHolder, "Longitude", "<input style='width: 40px;' type='text' id='lon' />");
			target.appendChild(generalSettingsHolder);
			
			origSettingsHolder = document.createElement('div');
			origSettingsHolder.className = 'prettyBoxList';
			origSettingsHolder.style.padding = 0;
			origSettingsHolder.style.paddingBottom = "10px";
			renderLeftRightLine(origSettingsHolder, "NWS Office", "<select id='orig'></select>");
			renderLeftRightLine(origSettingsHolder, "Weather Zone", "<select id='wxZone'></select>");
			target.appendChild(origSettingsHolder);
			
			rwrOrigSettingsHolder = document.createElement('div');
			rwrOrigSettingsHolder.className = 'prettyBoxList';
			rwrOrigSettingsHolder.style.padding = 0;
			rwrOrigSettingsHolder.style.paddingBottom = "10px";
			renderLeftRightLine(rwrOrigSettingsHolder, "NWS Office (Weather Roundup)", "<select id='rwrOrig'></select>");
			renderLeftRightLine(rwrOrigSettingsHolder, "City", "<select id='city'></select>");
			target.appendChild(rwrOrigSettingsHolder);
			
			document.getElementById('orig').addEventListener('change', function(evt) {getForecastZone(evt.target.value);});
			document.getElementById('rwrOrig').addEventListener('change', function(evt) {getLocations(evt.target.value);});
			
			saveButtonHolder = document.createElement('div');
			saveButtonHolder.className = 'prettyBoxList';
			saveButtonHolder.style.padding = 0;
			saveButtonHolder.style.marginBottom = 0;
			saveButtonHolder.style.textAlign = 'center';
			saveButton = document.createElement('input');
			saveButton.type = 'button';
			saveButton.id = 'saveButton';
			saveButton.style.fontWeight = 'bold';
			saveButton.value = "Save";
			saveButton.style.width = "100%";
			saveButton.addEventListener('click', function() {
				if(selectedProfile != 0)
				{
					lastRadarCode = currentSettings[selectedProfile].radarCode;
					
					currentSettings[selectedProfile].radarCode = document.getElementById('radarCode').value;
					currentSettings[selectedProfile].stateAbbr = document.getElementById('stateAbbr').value;
					currentSettings[selectedProfile].orig = document.getElementById('orig').value;
					currentSettings[selectedProfile].rwrOrig = document.getElementById('rwrOrig').value;
					currentSettings[selectedProfile].wxZone = document.getElementById('wxZone').value;
					currentSettings[selectedProfile].city = document.getElementById('city').value;
					currentSettings[selectedProfile].lat = document.getElementById('lat').value;
					currentSettings[selectedProfile].lon = document.getElementById('lon').value;
					currentSettings[selectedProfile].timezone = document.getElementById('timezone').value;
					
					setCookie("localSettings", encodeProfile(currentSettings));
					
					//Make dummy request to dataHandler. This will reset the cookie if it's invalid
					xhttp.dummy = new XMLHttpRequest();
					xhttp.dummy.onreadystatechange = function()
					{
						if(this.readyState == 4 && this.status == 200)
						{
							//Request complete; reload settings view
							if(currentSettings[selectedProfile].radarCode != lastRadarCode) location.reload();
							else menuSelect(selectedMenu);
							delete xhttp.dummy;
						}
						
					}
					
					xhttp.dummy.open("GET", programPath + "dataHandler.php", true);
					xhttp.dummy.send();
				}
			});
			saveButtonHolder.appendChild(saveButton);
			target.appendChild(saveButtonHolder);
			
			//Set up interface
			if(selectedProfile == 0)
			{
				document.getElementById('deleteButton').disabled = true;
				document.getElementById('deleteButton').style.color = "";
				document.getElementById('radarCode').disabled = true;
				document.getElementById('stateAbbr').disabled = true;
				document.getElementById('orig').disabled = true;
				document.getElementById('rwrOrig').disabled = true;
				document.getElementById('wxZone').disabled = true;
				document.getElementById('city').disabled = true;
				document.getElementById('lat').disabled = true;
				document.getElementById('lon').disabled = true;
				document.getElementById('timezone').disabled = true;
			}
			else
			{
				document.getElementById('deleteButton').disabled = false;
				document.getElementById('deleteButton').style.color = "red";
				document.getElementById('radarCode').disabled = false;
				document.getElementById('stateAbbr').disabled = false;
				document.getElementById('orig').disabled = false;
				document.getElementById('rwrOrig').disabled = false;
				document.getElementById('wxZone').disabled = false;
				document.getElementById('city').disabled = false;
				document.getElementById('lat').disabled = false;
				document.getElementById('lon').disabled = false;
				document.getElementById('timezone').disabled = false;
			}
			
			//Latitude and longitude
			document.getElementById('lat').value = currentSettings[selectedProfile].lat;
			document.getElementById('lon').value = currentSettings[selectedProfile].lon;
			
			getForecastZone(currentSettings[selectedProfile].orig);
			getLocations(currentSettings[selectedProfile].rwrOrig);
			
			//Load most dropdowns
			xhttp.dropdowns = new XMLHttpRequest();
			xhttp.dropdowns.onreadystatechange = function()
			{
				if(this.readyState != 4) return;
				if(this.status == 200)
				{
					try{returnVal = JSON.parse(this.responseText);}
					catch(error)
					{
						target = document.getElementById('selectedProfileCardBody');
						target.innerHTML = "";
						target.className += " adminMessageBody";
						target.appendChild(document.createTextNode("The server returned bad data: " + this.responseText));
						delete xhttp.dropdowns;
						return;
					}
					
					//Radar Codes
					target = document.getElementById('radarCode');
					returnVal.radar.forEach((radarCode) => {
						newOption = document.createElement('option');
						newOption.value = radarCode;
						newOption.text = radarCode;
						target.appendChild(newOption);
					});
					
					target.value = currentSettings[selectedProfile].radarCode;
					
					//State Dropdown
					target = document.getElementById('stateAbbr');
					returnVal.stateAbbr.forEach((stateAbbr) => {
						newOption = document.createElement('option');
						newOption.value = stateAbbr;
						newOption.text = stateAbbr;
						target.appendChild(newOption);
					});
					
					target.value = currentSettings[selectedProfile].stateAbbr;
					
					//Originators
					target = document.getElementById('orig');
					returnVal.orig.forEach((orig) => {
						newOption = document.createElement('option');
						newOption.value = orig.orig + orig.state;
						newOption.text = orig.state + " - " + orig.orig;
						target.appendChild(newOption);
					});
					
					target.value = currentSettings[selectedProfile].orig;
					
					//Originators - RWR
					target = document.getElementById('rwrOrig');
					returnVal.rwrOrig.forEach((rwrOrig) => {
						newOption = document.createElement('option');
						newOption.value = rwrOrig.orig + rwrOrig.state;
						newOption.text = rwrOrig.state + " - " + rwrOrig.orig;
						target.appendChild(newOption);
					});
					
					target.value = currentSettings[selectedProfile].rwrOrig;
					
					//Timezone
					target = document.getElementById('timezone');
					returnVal.timezone.forEach((timezone) => {
						newOption = document.createElement('option');
						newOption.value = timezone;
						newOption.text = timezone;
						target.appendChild(newOption);
					});
					
					target.value = currentSettings[selectedProfile].timezone;
				}
				else
				{
					target = document.getElementById('selectedProfileCardBody');
					target.style.textAlign = 'center';
					target.innerHTML = "The server returned error code " + this.status + " (" + this.statusText + ")";
					mainContent.className = "singleCard";
				}
				
				delete xhttp.dropdowns;
			}

			xhttp.dropdowns.open("GET", programPath + "dataHandler.php?type=settings&dropdown=general", true);
			xhttp.dropdowns.send();
		}
		
		//Set up theme card
		xhttp.theme = new XMLHttpRequest();
		xhttp.theme.onreadystatechange = function()
		{
			if(this.readyState != 4) return;
			target = document.getElementById('selectedThemeCardBody');
			target.innerHTML = "";
			
			if(this.status == 200)
			{
				try{returnVal = JSON.parse(this.responseText);}
				catch(error)
				{
					target.appendChild(document.createTextNode("The server returned bad data:" + this.responseText));
					target.className += " adminMessageBody";
					delete xhttp.theme;
					return;
				}
				
				target.style.textAlign = "center";
				themeSelector = document.createElement('select');
				themeSelector.id = 'themeSelector';
				themeSelector.style.width = "100%";
				
				Object.keys(returnVal).forEach(thisTheme => {
					newOption = document.createElement('option');
					newOption.value = thisTheme;
					newOption.text = returnVal[thisTheme];
					themeSelector.appendChild(newOption);
				});
				
				themeSelector.value = config.theme;
				themeSelector.addEventListener('change', function() {
					setCookie("selectedTheme", document.getElementById('themeSelector').value);
					location.reload();
				});
				
				target.appendChild(themeSelector);
			}
			else
			{
				target.innerHTML = "The server returned error code " + this.status + " (" + this.statusText + ")";
				target.style.textAlign = "center";
			}
			
			delete xhttp.theme;
		}
		
		xhttp.theme.open("GET", programPath + "dataHandler.php?type=settings&dropdown=theme", true);
		xhttp.theme.send();
		break;
		
		case 'System-Info':
		barTitle.innerHTML = "System Info";
		mainContent.innerHTML = "";
		
		if(config.showSysInfo)
		{
			renderStiffCard("sys", "System Info");
			renderStiffCard("sysTemp", "System Temps");
			
			if(config.showSatdumpInfo)
			{
				renderStiffCard("satDumpInfo", "SatDump Info");
			}
			if(config.showGraphs)
			{
				renderStatsCard("viterbi", "Viterbi Error Corrections/Packet");
				renderStatsCard("rs", "Reed-Solomon Error Corrections/Second");
				renderStatsCard("packets", "Packets/Second");
				renderStatsCard("freq", "Frequency Offset");
				renderStatsCard("gain", "Gain");
				renderStatsCard("omega", "Omega");
			}
			
			//AJAX load system information
			xhttp.sysInfo = new XMLHttpRequest();
			xhttp.sysInfo.onreadystatechange = function()
			{
				if(this.readyState != 4) return;
				target = document.getElementById('sysCardBody');
				
				if(this.status == 200)
				{
					//General System Information
					try{responseData = JSON.parse(this.responseText);}
					catch(error)
					{
						target.innerHTML = "";
						target.appendChild(document.createTextNode("The server returned bad data: " + this.responseText));
						target.className += " adminMessageBody";
						
						target = document.getElementById('sysTempCardBody');
						removeCard(target);
						delete xhttp.sysInfo;
						return;
					}
					
					if(responseData.sysData.length == 0) removeCard(target);
					else
					{
						target.innerHTML = "";
						responseData.sysData.forEach((sysValue) => {renderLeftRightLine(target, sysValue.name, sysValue.value);});
					}
					
					//Temp Info
					target = document.getElementById('sysTempCardBody');
					if(responseData.tempData.length == 0) removeCard(target);
					else
					{
						target.innerHTML = "";
						responseData.tempData.forEach((tempValue) => {renderLeftRightLine(target, tempValue.name, tempValue.value);});
					}
					
					//SatDump Info
					if(config.showSatdumpInfo)
					{
						target = document.getElementById('satDumpInfoCardBody');
						if(responseData.satdumpData.length == 0) target.innerHTML = "<div style='text-align: center;'>SatDump Statistics Unavailable!</div>";
						else
						{
							target.innerHTML = "";
							responseData.satdumpData.forEach((value) => {
								satdumpDataTitle = document.createElement('div');
								satdumpDataTitle.className = 'prettyBoxList';
								satdumpDataTitle.style.padding = 0;
								satdumpDataTitle.style.paddingTop = "5px";
								renderLeftRightLine(satdumpDataTitle, value.title, "");
								target.appendChild(satdumpDataTitle);
								
								satdumpDataHolder = document.createElement('div');
								satdumpDataHolder.className = 'prettyBoxList';
								satdumpDataHolder.style.padding = 0;
								satdumpDataHolder.style.paddingBottom = "10px";
								satdumpDataHolder.style.marginBottom = 0;
								
								value.values.forEach((subvalue) => {
									renderLeftRightLine(satdumpDataHolder, subvalue.name, subvalue.value);
								});
								
								target.appendChild(satdumpDataHolder);
							});
						}
					}
				}
				else
				{
					target.innerHTML = "The server returned error code " + this.status + " (" + this.statusText + ")";
					target.style.textAlign = "center";
					
					target = document.getElementById('sysTempCardBody');
					removeCard(target);
				}
				
				delete xhttp.sysInfo;
			}
			
			xhttp.sysInfo.open("GET", programPath + "dataHandler.php?type=metadata&id=sysInfo", true);
			xhttp.sysInfo.send();
		}
		break;
		
		default:
			if(Object.keys(config.categories).includes(selectedMenu))
			{
				barTitle.innerHTML = config.categories[selectedMenu].title;
				mainContent.innerHTML = "";
				Object.keys(config.categories[selectedMenu].data).forEach(function(key){renderImageCard(key, config.categories[selectedMenu].data[key].color);});
			}
			break;
	}
	columnCalc();
}

function showCollapseCard(event)
{
	if(event.currentTarget.nextSibling.style.display == "none")
	{
		expandedCards.push(event.currentTarget.nextSibling.id);
		chevron = event.currentTarget.querySelector('.fa-chevron-right');
		chevron.classList.toggle("fa-chevron-right");
		chevron.classList.toggle("fa-chevron-down");
		event.currentTarget.nextSibling.style.display = "block";
		if(event.currentTarget.nextSibling.nextSibling != null) event.currentTarget.nextSibling.nextSibling.style.display = "block";
		
		if(selectedMenu == "System-Info") loadStats(event.currentTarget.nextSibling);
		else if(event.currentTarget.nextSibling.innerHTML == "Loading, please wait...") loadImageMetadata(event.currentTarget.nextSibling);
	}
	else
	{
		while(expandedCards.indexOf(event.currentTarget.nextSibling.id) > -1) expandedCards.splice(expandedCards.indexOf(event.currentTarget.nextSibling.id), 1);
		chevron = event.currentTarget.querySelector('.fa-chevron-down');
		chevron.classList.toggle("fa-chevron-down");
		chevron.classList.toggle("fa-chevron-right");
		event.currentTarget.nextSibling.style.display = "none";
		if(event.currentTarget.nextSibling.nextSibling != null) event.currentTarget.nextSibling.nextSibling.style.display = "none";
	}
	
	sessionStorage.setItem('expandedCards', JSON.stringify(expandedCards));
}
function loadStats(targetedContent)
{
	if(targetedContent.innerHTML == "Loading, please wait...")
	{
		xhttp.loadStats = new XMLHttpRequest();
		xhttp.loadStats.onreadystatechange = function()
		{
			if(this.readyState != 4) return;
			if(this.status == 200)
			{
				try{metadata = JSON.parse(this.responseText);}
				catch(error)
				{
					targetedContent.innerHTML = "";
					targetedContent.appendChild(document.createTextNode("The server returned bad data: " + this.responseText));
					targetedContent.className += " adminMessageBody";
					delete xhttp.loadStats;
					return;
				}
				
				targetedContent.innerHTML = "";
				parser = new DOMParser();
				
				svg1hr = parser.parseFromString(metadata['svg1hr'], "image/svg+xml");
				svg1hr.documentElement.style.width = "100%";
				svg1hr.documentElement.style.height = "auto";
				targetedContent.appendChild(svg1hr.documentElement);
				targetedContent.appendChild(document.createElement('br'));
				
				svg1day = parser.parseFromString(metadata['svg1day'], "image/svg+xml");
				svg1day.documentElement.style.width = "100%";
				svg1day.documentElement.style.height = "auto";
				targetedContent.appendChild(svg1day.documentElement);
				
				description = document.createElement('div');
				description.className = "goeslabel";
				description.innerHTML = metadata['description'];
				targetedContent.appendChild(description);
			}
			else
			{
				targetedContent.innerHTML = "The server returned error code " + this.status + "<br /><span class='goeslabel'>" + this.statusText + "</div>";
				targetedContent.style.textAlign = 'center';
			}
			
			delete xhttp.loadStats;
		}
		
		xhttp.loadStats.open("GET", programPath + "dataHandler.php?type=metadata&id=" + targetedContent.id, true);
		xhttp.loadStats.send();
	}
}
function loadLocalRadar(targetedContent, metadata)
{
	targetedContent.innerHTML = "";
	goesImg = document.createElement('img');
	goesImg.className = "goesimg";
	goesImg.id = 'lightbox-localRadar';
	goesImg.src = programPath + "dataHandler.php?type=localRadarData&timestamp=" + metadata.images[metadata.images.length - 1]['timestamp'];
	goesImg.addEventListener('click', function(event){lightGalleries[event.target.id].openGallery(lightGalleries[event.target.id].galleryItems.length - 1);});
	goesImg.addEventListener('lgBeforeOpen', function(event){
		document.getElementsByTagName('body')[0].style.overflow = "hidden";
		document.getElementsByTagName('html')[0].style.touchAction = "none";
	});
	goesImg.addEventListener('lgAfterClose', function(event){
		document.getElementsByTagName('body')[0].style.overflow = "";
		document.getElementsByTagName('html')[0].style.touchAction = "";
	});

	targetedContent.appendChild(goesImg);

	goesLabel = document.createElement('div');
	goesLabel.className = "goeslabel";
	goesLabel.innerHTML = metadata.images[metadata.images.length - 1]['description'];
	targetedContent.appendChild(goesLabel);


	dynamicEl = [];
	metadata.images.forEach(thisImg => {dynamicEl.push({src: programPath + "dataHandler.php?type=localRadarData&timestamp=" + thisImg['timestamp'],
		subHtml: "<b>" + metadata.title + "</b><div class='lgLabel'>" + thisImg['description'] + "</div>", timestamp: thisImg['timestamp']});});
	
	lightGalleries['lightbox-localRadar'] = lightGallery(goesImg, {
		plugins: [lgZoom, lgJumpTo],
		loop: false,
		mode: "lg-jumptotrans",
		speed: 0,
		dynamic: true,
		dynamicEl: dynamicEl,
		mobileSettings: {download: true, controls: false, showCloseIcon: false}
	});
}
function loadHurricane(targetedContent, id, product, title, metadata)
{
	targetedContent.innerHTML = "";
	goesImg = document.createElement('img');
	goesImg.className = "goesimg";
	goesImg.id = "lightbox-" + product + id;
	goesImg.src = programPath + "dataHandler.php?type=hurricaneData&id=" + id + "&product=" + product + "&timestamp=" + metadata[metadata.length - 1]['timestamp'];
	goesImg.addEventListener('click', function(event){lightGalleries[event.target.id].openGallery(lightGalleries[event.target.id].galleryItems.length - 1);});
	goesImg.addEventListener('lgBeforeOpen', function(event){
		document.getElementsByTagName('body')[0].style.overflow = "hidden";
		document.getElementsByTagName('html')[0].style.touchAction = "none";
	});
	goesImg.addEventListener('lgAfterClose', function(event){
		document.getElementsByTagName('body')[0].style.overflow = "";
		document.getElementsByTagName('html')[0].style.touchAction = "";
	});

	targetedContent.appendChild(goesImg);

	goesLabel = document.createElement('div');
	goesLabel.className = "goeslabel";
	goesLabel.innerHTML = metadata[metadata.length - 1]['description'];
	targetedContent.appendChild(goesLabel);


	dynamicEl = [];
	metadata.forEach(thisImg => {dynamicEl.push({src: programPath + "dataHandler.php?type=hurricaneData&id=" + id + "&product=" + product + "&timestamp=" + thisImg['timestamp'],
		subHtml: "<b>" + title + "</b><div class='lgLabel'>" + thisImg['description'] + "</div>", timestamp: thisImg['timestamp']});});
	
	lightGalleries["lightbox-" + product + id] = lightGallery(goesImg, {
		plugins: [lgZoom, lgJumpTo],
		loop: false,
		mode: "lg-jumptotrans",
		speed: 0,
		dynamic: true,
		dynamicEl: dynamicEl,
		mobileSettings: {download: true, controls: false, showCloseIcon: false}
	});
}
function loadImageMetadata(targetedContent)
{
	xhttp.loadImage = new XMLHttpRequest();
	xhttp.loadImage.onreadystatechange = function()
	{
		if(this.readyState != 4) return;
		if(this.status == 200)
		{
			try{metadata = JSON.parse(this.responseText);}
			catch(error)
			{
				targetedContent.innerHTML = "";
				targetedContent.appendChild(document.createTextNode("The server returned bad data: " + this.responseText));
				targetedContent.className += " adminMessageBody";
				delete xhttp.loadImage;
				return;
			}
			
			loadImage(targetedContent, metadata.images, metadata.title);
		}
		
		else targetedContent.innerHTML = "The server returned error code " + this.status + "<br /><span class='goeslabel'>" + this.statusText + "</div>";
		delete xhttp.loadImage;
	}
	
	xhttp.loadImage.open("GET", programPath + "dataHandler.php?type=metadata&id=" + selectedMenu + "&subid=" + targetedContent.id.replace('Content', ''), true);
	xhttp.loadImage.send();
}
function loadImage(targetedContent, metadata, title = "")
{
	contentId = targetedContent.id.replace('Content', '');
	if(metadata.length == 0)
	{
		targetedContent.innerHTML = "<div style='margin-bottom: 5px;'>No images found</div>";
		return;
	}
	
	targetedContent.innerHTML = "";
	goesImg = document.createElement('img');
	goesImg.className = "goesimg";
	goesImg.id = 'lightbox-' + contentId;
	goesImg.src = programPath + "dataHandler.php?type=data&id=" + selectedMenu + "&subid=" + contentId + "&timestamp=" + metadata[metadata.length - 1]['timestamp'];
	goesImg.addEventListener('click', function(event){lightGalleries[event.target.id].openGallery(lightGalleries[event.target.id].galleryItems.length - 1);});
	goesImg.addEventListener('lgBeforeOpen', function(event){
		document.getElementsByTagName('body')[0].style.overflow = "hidden";
		document.getElementsByTagName('html')[0].style.touchAction = "none";
	});
	goesImg.addEventListener('lgAfterClose', function(event){
		document.getElementsByTagName('body')[0].style.overflow = "";
		document.getElementsByTagName('html')[0].style.touchAction = "";
	});
	
	targetedContent.appendChild(goesImg);
	
	goesLabel = document.createElement('div');
	goesLabel.className = "goeslabel";
	goesLabel.innerHTML = metadata[metadata.length - 1]['description'];
	targetedContent.appendChild(goesLabel);
	
	dynamicEl = [];
	metadata.forEach(thisImg => {
		if('subHtml' in thisImg) thisSub = thisImg['subHtml'];
		else thisSub = "<b>" + title + "</b><div class='lgLabel'>" + thisImg['description'] + "</div>";
		dynamicEl.push({
			src: programPath + "dataHandler.php?type=data&id=" + selectedMenu + "&subid=" + contentId + "&timestamp=" + thisImg['timestamp'],
			description: thisImg['description'], subHtml: thisSub, timestamp: thisImg['timestamp']
		});
	});
		
	lightGalleries["lightbox-" + contentId] = lightGallery(goesImg, {
		plugins: [lgZoom, lgJumpTo],
		loop: false,
		mode: "lg-jumptotrans",
		speed: 0,
		dynamic: true,
		dynamicEl: dynamicEl,
		mobileSettings: {download: true, controls: false, showCloseIcon: false}
	});
}

function switchCardView(event)
{
	if(event.currentTarget.classList.contains("selected")) return;
	
	me = event.currentTarget;
	sibling = me.parentNode.firstChild;
	
	do
	{
		if(sibling.classList.contains("selected")) sibling.classList.remove("selected");
		sibling = sibling.nextSibling;
		
	} while(sibling != null);
	me.classList.add("selected");
	
	if(me.id.endsWith("-Recent"))
	{
		replayMetadata = lightGalleries['lightbox-' + me.id.replace("-Recent", "")].galleryItems;
		lightGalleries['lightbox-' + me.id.replace("-Recent", "")].destroy();
		delete lightGalleries['lightbox-' + me.id.replace("-Recent", "")];
		
		me.parentNode.previousSibling.innerHTML = "Loading, please wait...";
		loadImage(me.parentNode.previousSibling, replayMetadata);
	}
	else me.parentNode.previousSibling.innerHTML = "<video controls loop autoplay playsinline style='width: 100%;'><source src='" + programPath + "videos/" + config.categories[selectedMenu].data[me.id.replace("-timelapse", "")].videoPath + "' type='video/mp4' /></video>";
}

function switchRadarView(event)
{
	if(event.currentTarget.classList.contains("selected")) return;
	
	me = event.currentTarget;
	sibling = me.parentNode.firstChild;
	
	do
	{
		if(sibling.classList.contains("selected")) sibling.classList.remove("selected");
		sibling = sibling.nextSibling;
		
	} while(sibling != null);
	me.classList.add("selected");
	
	if(me.id.endsWith("-Recent")) loadLocalRadar(me.parentNode.previousSibling, responseData.localRadarMetadata);
	else
	{
		lightGalleries['lightbox-localRadar'].destroy();
		delete lightGalleries['lightbox-localRadar'];
		me.parentNode.previousSibling.innerHTML = "<video controls loop autoplay playsinline style='width: 100%;'><source src='" + programPath + "videos/" + config.localRadarVideo + "' type='video/mp4' /></video>";
	}
}

window.addEventListener("popstate", function(event){menuSelect(event.state.menuSlug);});
window.addEventListener("appinstalled", function()
{
	siteName = "";
	document.title = document.querySelector(".menuItem.selected").lastChild.innerHTML;
});
window.addEventListener("load", function()
{
	//Query config from server
	xhttp.preload = new XMLHttpRequest();
	xhttp.preload.onreadystatechange = function()
	{
		if(this.readyState != 4) return;
		if(this.status == 200)
		{
			try {config = JSON.parse(this.responseText);}
			catch(error)
			{
				renderCollapsingCard("serverError", "The server returned bad data. Click to expand", "prettyBoxContent", "adminMessageBody");
				target = document.getElementById('serverErrorContent').firstChild;
				target.innerHTML = this.responseText;
				mainContent.className = "singleCard";
				delete xhttp.preload;
				return;
			}
			
			//Render Menu Items
			if(config.showCurrentWeather) renderMenuItem('Current-Weather', 'cloud', 'Current Weather');
			Object.keys(config.categories).forEach((type) => { renderMenuItem(type, config.categories[type].icon, config.categories[type].title); });
			if(config.showAdminInfo || config.showEmwinInfo) renderMenuItem('Other-EMWIN', 'align-left', 'Other EMWIN');
			if(config.showEmwinInfo) renderMenuItem('Hurricane-Center', 'wind', 'Hurricane Center');
			renderMenuItem('Local-Settings', 'cogs', 'Local Settings');
			if(config.showGraphs || config.showSysInfo) renderMenuItem('System-Info', 'info-circle', 'System Info');
			
			//Select the topmost menu if one is not selected
			pathnameSplit = window.location.pathname.split('/');
			pathSegments = pathnameSplit.slice(1);
			selectedMenu = pathSegments[pathSegments.length - 1];
			if(selectedMenu == "") selectedMenu = document.getElementById('sideBar').getElementsByClassName('menuItem')[0].id.replace("menuItem", "");
			
			//Load the menu
			menuSelect(selectedMenu);
		}
		else
		{
			renderStiffCard("serverError", "The server returned error " + this.status);
			targetedContent = document.getElementById('serverErrorCardBody');
			targetedContent.style.textAlign = 'center';
			targetedContent.innerHTML = this.statusText;
			mainContent.className = "singleCard";
		}
		
		delete xhttp.preload;
	}
	
	xhttp.preload.open("GET", programPath + "dataHandler.php?type=preload", true);
	xhttp.preload.send();
});
