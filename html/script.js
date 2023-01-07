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
var config;
var imageType;

//Load current state from sessionStorage
storedSelectedMenu = sessionStorage.getItem('selectedMenu');
if(storedSelectedMenu == null)
{
	var selectedMenu = 0;
	sessionStorage.setItem('selectedMenu', 0);
}
else var selectedMenu = parseInt(storedSelectedMenu);

//Load expanded cards from sessionStorage
storedExpandedCards = sessionStorage.getItem('expandedCards');
if(storedExpandedCards == null)
{
	var expandedCards = [];
	sessionStorage.setItem('expandedCards', "[]");
}
else var expandedCards = JSON.parse(storedExpandedCards);

function getCookie(name)
{
	return decodeURIComponent((name = (document.cookie + ';').match(new RegExp(name + '=.*;'))) && name[0].split(/=|;/)[1]);
}

function setCookie(name, value)
{
	var e = new Date;
	e.setDate(e.getDate() + 365);
	document.cookie = name + "=" + encodeURIComponent(value) + ';expires=' + e.toUTCString() + ';path=/;domain=.' + document.domain;
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
function renderImageCard(slug, color)
{
	card = document.createElement('div');
	card.className = "prettyBox";
	if(color != null) card.style.backgroundColor = color;
	
	header = document.createElement('div');
	header.className = "prettyBoxHeader";
	header.innerHTML = "<i class='fa fa-chevron-" + (expandedCards.includes(slug + "Content") ? "down" : "right") + "' aria-hidden='true'></i>&nbsp;&nbsp;&nbsp;&nbsp;" + config[imageType][slug].title;
	header.addEventListener('click', showCollapseCard);
	card.appendChild(header);
	content = document.createElement('div');
	content.id = slug + "Content";
	content.className = "prettyBoxContent";
	content.innerHTML = "Loading, please wait...";
	content.style.display = expandedCards.includes(slug + "Content") ? "block" : "none";
	card.appendChild(content);
	
	if(config[imageType][slug].videoPath)
	{
		links = document.createElement('div');
		links.className = "mapLinks";
		links.style.display = expandedCards.includes(slug + "Content") ? "block" : "none";
		recent = document.createElement('span');
		recent.className = "spanLink selected";
		recent.innerHTML = "Current&nbsp;&nbsp;";
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
	cardHeader.innerHTML = "<i class='fa fa-chevron-" + (expandedCards.includes(slug + "Content") ? "down" : "right") + "' aria-hidden='true'></i>&nbsp;&nbsp;&nbsp;&nbsp;" + name;
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
	header.innerHTML = "<i class='fa fa-chevron-" + (expandedCards.includes(slug + "Content") ? "down" : "right") + "' aria-hidden='true'></i>&nbsp;&nbsp;&nbsp;&nbsp;" + name;
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
	
	//Extra Element to Help with Card Flow
	mainContent.appendChild(document.createElement('div'));
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

	xhttp.getForecastZone.open("GET", "dataHandler.php?type=settings&dropdown=wxZone&orig=" + orig, true);
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
	
	xhttp.getLocations.open("GET", "dataHandler.php?type=settings&dropdown=city&rwrOrig=" + rwrOrig, true);
	xhttp.getLocations.send();
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
function menuSelect(menuNumber)
{
	retractDrawer();
	
	//Do nothing if there are no valid menus (there is always at least 1 child, even with no menus)
	if(document.getElementById('sideBar').childElementCount < 2)
	{
		mainContent.innerHTML = "<div style='height: 30px;'></div><div class='errorMessage'>No data found to display! Please verify the server config</div>";
		mainContent.className = "singleCard";
		return;
	}
	
	//Select the new menu, and find the next good one if it's not available
	selectedMenuElement = document.getElementById('menuItem' + selectedMenu);
	if(selectedMenuElement) selectedMenuElement.className = 'menuItem';
	
	menuDidDisappear = false;
	while(!document.getElementById('menuItem' + menuNumber))
	{
		if(menuDidDisappear) menuNumber++;
		else
		{
			menuDidDisappear = true;
			menuNumber = 0;
		}			
	}
	document.getElementById('menuItem' + menuNumber).className = 'menuItem selected';
	
	if(selectedMenu != menuNumber)
	{
		selectedMenu = menuNumber;
		sessionStorage.setItem('selectedMenu', selectedMenu);
		window.scrollTo({top: 0});
	}
	
	mainContent = document.getElementById('mainContent');
	barTitle = document.getElementById('barTitle');
	
	//Clear any remaining lightGalleries
	Object.keys(lightGalleries).forEach(thisGallery => {lightGalleries[thisGallery].destroy();});
	lightGalleries = [];
	
	//Stop any running AJAX requests
	Object.keys(xhttp).forEach(thisxhttp => {xhttp[thisxhttp].abort();});
	xhttp = [];
	
	switch(selectedMenu)
	{
		case 1: imageType = 'abi'; break;
		case 2: imageType = 'l2'; break;
		case 3: imageType = 'meso'; break;
		case 4: imageType = 'emwin'; break;
		default: imageType = ''; break;
	}
	
	if(typeof(EventSource) == "undefined")
	{
		mainContent.innerHTML = "<div style='height: 30px;'></div><div class='errorMessage'>Sorry! Internet Explorer does not support this site. Please use a real browser.</div>";
		mainContent.className = "singleCard";
		return;
	}
	
	//Load the selected menu
	switch(menuNumber)
	{
		case 0:
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
			recent.innerHTML = "Current&nbsp;&nbsp;";
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
			if(this.readyState == 4 && this.status == 200)
			{
				weatherInfo = JSON.parse(this.responseText);
				
				//Weather Alert
				if(weatherInfo.alert != "")
				{
					weatherAlert = document.createElement('div');
					weatherAlert.className = "prettyBox weatherAlert teal";
					weatherAlertContent = document.createElement('div');
					weatherAlertContent.className = "prettyBoxContent";
					weatherAlertContent.innerHTML = weatherInfo.alert;
					weatherAlert.appendChild(weatherAlertContent);
					
					document.getElementById('mainContent').prepend(document.createElement('div'));
					document.getElementById('mainContent').prepend(weatherAlert);
				}
				
				//Render Radar Card
				loadLocalRadar(document.getElementById("radarWeatherCardBody"), weatherInfo.localRadarMetadata);
				
				//Render Weather Card
				target = document.getElementById("currentWeatherCardBody");
				target.previousSibling.innerHTML += " - " + toTitleCase(weatherInfo.city) + ", " + weatherInfo.state;
				target.innerHTML = "";
				
				if("weatherDesc" in weatherInfo)
				{
					conditions = weatherInfo.weatherDesc;
					switch(weatherInfo.weatherDesc)
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
				
				if("temp" in weatherInfo) renderLeftRightLine(target, "Temperature", weatherInfo.temp + "&deg; F");
				if("humidity" in weatherInfo) renderLeftRightLine(target, "Humidity", weatherInfo.humidity + "%");
				if("dewPoint" in weatherInfo) renderLeftRightLine(target, "Dew Point", weatherInfo.dewPoint + "&deg; F");
				if("pressure" in weatherInfo) renderLeftRightLine(target, "Barometric Pressure", weatherInfo.pressure);
				if("wind" in weatherInfo && "windDirection" in weatherInfo) renderLeftRightLine(target, "Wind", (weatherInfo.wind == 0 ? "Calm" : weatherInfo.windDirection + ", " + weatherInfo.wind + " MPH"));
				if("windGust" in weatherInfo && weatherInfo.windGust != "N/A") renderLeftRightLine(target, "Wind Gust", weatherInfo.windGust);
				if("remarks" in weatherInfo && weatherInfo.remarks != "") renderLeftRightLine(target, "Remarks", weatherInfo.remarks);
				
				if(target.innerHTML == "") target.parentElement.parentElement.style.display = 'none';
				else target.innerHTML += "<div class='goeslabel'>Last Update: " + weatherInfo.weatherTime + "</div>";
				
				//Weather Summary
				if(weatherInfo.summary == "") document.getElementById("summaryWeatherCardBody").parentElement.parentElement.style.display = 'none';
				else document.getElementById("summaryWeatherCardBody").innerHTML = weatherInfo.summary + "<div class='goeslabel'>Last Update: " + weatherInfo.summaryTime + "</div>";
				
				//7 day forcast
				target = document.getElementById("sevenDayWeatherCardBody");
				if(weatherInfo.sevenDayForcast.length == 0) target.parentElement.parentElement.style.display = 'none';
				else
				{
					target.innerHTML = "";
					sevenDayForcastContainer = document.createElement('div');
					sevenDayForcastContainer.className = "forcastCardHolder";
					
					weatherInfo.sevenDayForcast.forEach(todaysForcast => {
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
					sevenDayForecastLastUpdate.innerHTML = "Last Update: " + weatherInfo.sevenDayForecastDate;
					target.appendChild(sevenDayForecastLastUpdate);
				}
				
				
				//Forecast
				target = document.getElementById("forecastWeatherCardBody");
				if(weatherInfo.forecast.length == 0) target.parentElement.parentElement.style.display = 'none';
				else
				{
					target.previousSibling.innerHTML += " - " + toTitleCase(weatherInfo.city) + ", " + weatherInfo.state;
					target.innerHTML = "";
					Object.keys(weatherInfo.forecast).forEach((key) => {target.innerHTML += "<p><b>" + key + ": </b>" + weatherInfo.forecast[key] + "</p>";});
					target.innerHTML += "<div class='goeslabel'>Last Update: " + weatherInfo.forecastTime + "</div>";
				}
				
				delete xhttp.weatherJSON;
			}
		}
		
		xhttp.weatherJSON.open("GET", "dataHandler.php?type=weatherJSON", true);
		xhttp.weatherJSON.send();
		
		//AJAX load alerts
		xhttp.alertJSON = new XMLHttpRequest();
		xhttp.alertJSON.onreadystatechange = function()
		{
			if(this.readyState == 4 && this.status == 200)
			{
				alertInfo = JSON.parse(this.responseText);
				
				//Weather Warnings
				alertInfo.weatherWarnings.forEach(function(element){renderAlert(element, "red")});
				alertInfo.hurricaneStatement.forEach(function(element){renderAlert(element, "red")});
				alertInfo.localEvacuations.forEach(function(element){renderAlert(element, "brown")});
				alertInfo.localEmergencies.forEach(function(element){renderAlert(element, "red")});
				alertInfo.blueAlerts.forEach(function(element){renderAlert(element, "blue")});
				alertInfo.amberAlerts.forEach(function(element){renderAlert(element, "amber")});
				alertInfo.civilDangerWarnings.forEach(function(element){renderAlert(element, "purple")});
				
				delete xhttp.alertJSON;
			}
		}
		xhttp.alertJSON.open("GET", "dataHandler.php?type=alertJSON", true);
		xhttp.alertJSON.send();
		break;
		
		case 1:
		barTitle.innerHTML = "Full Disk";
		mainContent.innerHTML = "";
		Object.keys(config.abi).forEach(function(key){renderImageCard(key, config.abi[key].color);});
		break;
		
		case 2:
		barTitle.innerHTML = "Level 2 Imagery";
		mainContent.innerHTML = "";
		Object.keys(config.l2).forEach(function(key){renderImageCard(key, config.l2[key].color);});
		break;
		
		case 3:
		barTitle.innerHTML = "Mesoscale Imagery";
		mainContent.innerHTML = "";
		Object.keys(config.meso).forEach(function(key){renderImageCard(key, config.meso[key].color);});
		break;

		case 4:
		barTitle.innerHTML = "EMWIN Imagery";
		mainContent.innerHTML = "";
		Object.keys(config.emwin).forEach(function(key){renderImageCard(key, config.emwin[key].color);});
		break;
		
		case 5:
		barTitle.innerHTML = "Other EMWIN";
		mainContent.innerHTML = "";
		
		if(config.showEmwinInfo)
		{
			renderCollapsingCard("spaceWeatherMessage", "Space Weather Messages", "prettyBoxContent noPadding", "weatherBody");
			renderCollapsingCard("radarOutage", "Local Radar Outages", "prettyBoxContent noPadding", "weatherBody");
			renderCollapsingCard("adminAlert", "EMWIN Admin Alerts", "prettyBoxContent noPadding", "weatherBody");
			renderCollapsingCard("adminRegional", "EMWIN Regional Admin Message", "prettyBoxContent noPadding", "weatherBody");
			renderCollapsingCard("satelliteTle", "Weather Satellite TLE", "prettyBoxContent", "weatherBody");
			renderCollapsingCard("emwinLicense", "EMWIN Licensing Info", "prettyBoxContent", "weatherBody");
		}
		if(config.showAdminInfo) renderCollapsingCard("adminMessage", "Latest Admin Message", "prettyBoxContent", "otherEmwinBody");
		
		xhttp.otherEMWIN = new XMLHttpRequest();
		xhttp.otherEMWIN.onreadystatechange = function()
		{
			if(this.readyState == 4 && this.status == 200)
			{
				otherEmwinInfo = JSON.parse(this.responseText);
				
				if(config.showEmwinInfo)
				{
					//Space Weather Messages
					target = document.getElementById('spaceWeatherMessageContent').firstChild;
					target.innerHTML = "";
					otherEmwinInfo.spaceWeatherMessages.forEach((element) => {
						newAlert = document.createElement('div');
						newAlert.className = 'prettyBoxList';
						newAlert.innerHTML = element;
						target.appendChild(newAlert);
					});
					
					//Radar Outages
					target = document.getElementById('radarOutageContent').firstChild;
					target.innerHTML = "";
					otherEmwinInfo.radarOutages.forEach((element) => {
						newAlert = document.createElement('div');
						newAlert.className = 'prettyBoxList';
						newAlert.innerHTML = element;
						target.appendChild(newAlert);
					});
					
					//EMWIN Admin Alerts
					target = document.getElementById('adminAlertContent').firstChild;
					target.innerHTML = "";
					otherEmwinInfo.adminAlerts.forEach((element) => {
						newAlert = document.createElement('div');
						newAlert.className = 'prettyBoxList';
						newAlert.innerHTML = element;
						target.appendChild(newAlert);
					});
					
					//EMWIN Regional Alerts
					target = document.getElementById('adminRegionalContent').firstChild;
					target.innerHTML = "";
					otherEmwinInfo.adminRegional.forEach((element) => {
						newAlert = document.createElement('div');
						newAlert.className = 'prettyBoxList';
						newAlert.innerHTML = element;
						target.appendChild(newAlert);
					});
					
					//Weather Satellite TLE
					target = document.getElementById('satelliteTleContent').firstChild;
					if(otherEmwinInfo.satelliteTle.length == 0) target.innerHTML = "<div style='text-align: center; font-weight: bold; font-size: 13pt;'>Satellite TLEs are currently unavailable</div>";
					else
					{
						target.innerHTML = "<p style='font-weight: bold;'>TLEs for the following satellites are available from GOES</p>";
						otherEmwinInfo.satelliteTle.forEach((element) => {
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
						downloadButton.addEventListener('click', function(){window.location = '/dataHandler.php?type=tle';});
						downloadButtonHolder.appendChild(downloadButton);
						target.appendChild(downloadButtonHolder);
						
						satelliteTleLastUpdate = document.createElement('div');
						satelliteTleLastUpdate.className = "goeslabel";
						satelliteTleLastUpdate.innerHTML = "Last Broadcast: " + otherEmwinInfo.satelliteTleDate;
						target.parentElement.appendChild(satelliteTleLastUpdate);
					}
					
					//EMWIN Licensing Info
					target = document.getElementById('emwinLicenseContent').firstChild;
					target.innerHTML = otherEmwinInfo.emwinLicense;
					
					adminMessageLastUpdate = document.createElement('div');
					adminMessageLastUpdate.className = "goeslabel";
					adminMessageLastUpdate.innerHTML = "Last Broadcast: " + otherEmwinInfo.emwinLicenseDate;
					target.parentElement.appendChild(adminMessageLastUpdate);
				}
				
				if(config.showAdminInfo)
				{
					//Latest Admin message
					target = document.getElementById('adminMessageContent').firstChild;
					target.innerHTML = otherEmwinInfo.latestAdmin;
					
					adminMessageLastUpdate = document.createElement('div');
					adminMessageLastUpdate.className = "goeslabel";
					adminMessageLastUpdate.innerHTML = "Last Updated: " + otherEmwinInfo.latestAdminDate;
					target.parentElement.appendChild(adminMessageLastUpdate);
				}
				
				delete xhttp.otherEMWIN;
			}
		}
		xhttp.otherEMWIN.open("GET", "dataHandler.php?type=metadata&id=otherEmwin", true);
		xhttp.otherEMWIN.send();
		break;
		
		case 6:
		barTitle.innerHTML = "Hurricane Center";
		mainContent.innerHTML = "";
		renderStiffCard("loadingNotice", "Hurricane Info");
		
		xhttp.hurricaneInfo = new XMLHttpRequest();
		xhttp.hurricaneInfo.onreadystatechange = function()
		{
			if(this.readyState == 4 && this.status == 200)
			{
				hurricaneInfo = JSON.parse(this.responseText);
				if(Object.keys(hurricaneInfo).length == 0)
				{
					document.getElementById('loadingNoticeCardBody').innerHTML = "<div style='text-align: center;'>No tropical activity at this time</div>";
				}
				else
				{
					mainContent.innerHTML = "";
					Object.keys(hurricaneInfo).forEach(thisHurricane => {
						renderCollapsingCard(thisHurricane, hurricaneInfo[thisHurricane].title, "prettyBoxContent noPadding", "weatherBody");
						thisCardBody = document.getElementById(thisHurricane + "Content").firstChild;
						thisCardBody.innerHTML = "";
						
						//Display advisory information if we have it
						if("latestAdvisory" in hurricaneInfo[thisHurricane])
						{
							advisoryItem = document.createElement('div');
							advisoryItem.className = 'prettyBoxList';

							if("latestAdvTime" in hurricaneInfo[thisHurricane]) renderLeftRightLine(advisoryItem, "Advisory Time", hurricaneInfo[thisHurricane].latestAdvTime);
							renderLeftRightLine(advisoryItem, "Advisory Number", hurricaneInfo[thisHurricane].latestAdvisory);
							if("position" in hurricaneInfo[thisHurricane]) renderLeftRightLine(advisoryItem, "Position", hurricaneInfo[thisHurricane].position);
							if("movement" in hurricaneInfo[thisHurricane]) renderLeftRightLine(advisoryItem, "Moving", hurricaneInfo[thisHurricane].movement);
							if("pressure" in hurricaneInfo[thisHurricane]) renderLeftRightLine(advisoryItem, "Pressure", hurricaneInfo[thisHurricane].pressure);
							if("maxWind" in hurricaneInfo[thisHurricane]) renderLeftRightLine(advisoryItem, "Max Winds", hurricaneInfo[thisHurricane].maxWind);
							if("status" in hurricaneInfo[thisHurricane]) renderLeftRightLine(advisoryItem, "Status", hurricaneInfo[thisHurricane].status);
							if("nextMessage" in hurricaneInfo[thisHurricane]) renderLeftRightLine(advisoryItem, "Next Message", hurricaneInfo[thisHurricane].nextMessage);
							
							thisCardBody.appendChild(advisoryItem);
						}
						
						//RS images
						if("RS" in hurricaneInfo[thisHurricane])
						{
							rsItem = document.createElement('div');
							rsItem.className = 'prettyBoxList';
							thisCardBody.appendChild(rsItem);
							loadHurricane(rsItem, "RS", thisHurricane, hurricaneInfo[thisHurricane].RS);
						}
						
						//WS images
						if("WS" in hurricaneInfo[thisHurricane])
						{
							wsItem = document.createElement('div');
							wsItem.className = 'prettyBoxList';
							thisCardBody.appendChild(wsItem);
							loadHurricane(wsItem, "WS", thisHurricane, hurricaneInfo[thisHurricane].WS);
						}
						
						//5D images
						if("5D" in hurricaneInfo[thisHurricane])
						{
							fdItem = document.createElement('div');
							fdItem.className = 'prettyBoxList';
							fdItem.style.paddingTop = "5px";
							loadHurricane(fdItem, "5D", thisHurricane, hurricaneInfo[thisHurricane]["5D"]);
							
							fdHeader = document.createElement('div');
							fdHeader.className = 'hurricaneForecastHeader';
							fdHeader.innerHTML = "5-Day Forecast"
							fdItem.prepend(fdHeader);
							
							thisCardBody.appendChild(fdItem);
						}
					});
				}
				
				if(mainContent.childElementCount <= 2) mainContent.className = "singleCard";
				else if(mainContent.childElementCount <= 4) mainContent.className = "dualCard";
				else mainContent.className = "mainContent";
				delete xhttp.hurricaneInfo;
			}
		}
		xhttp.hurricaneInfo.open("GET", "dataHandler.php?type=hurricaneJSON", true);
		xhttp.hurricaneInfo.send();
		break;
		
		case 7:
		barTitle.innerHTML = "Local Settings";
		mainContent.innerHTML = "";
		
		//Render main cards
		if(config.showEmwinInfo) renderStiffCard("selectedProfile", "Location Settings Profile");
		renderStiffCard("selectedTheme", "Web App Theme");
		
		if(config.showEmwinInfo)
		{
			//Set up profile
			selectedProfile = parseInt(getCookie('selectedProfile'));
			currentSettings = JSON.parse(getCookie('currentSettings'));
			profileSelectorHolder = document.createElement('div');
			profileSelectorHolder.className = 'prettyBoxList';
			profileSelectorHolder.style.padding = 0;
			profileSelectorHolder.style.paddingBottom = "10px";
			profileSelectorHolder.style.textAlign = 'center';
			profileSelectorHolder.innerHTML = "<span style='font-weight: bold;'>Profile: </span>";
			
			profileSelector = document.createElement('select');
			profileSelector.id = 'profileSelector';
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
				setCookie("currentSettings", JSON.stringify(currentSettings));
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
				
				setCookie("currentSettings", JSON.stringify(currentSettings));
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
					
					setCookie("currentSettings", JSON.stringify(currentSettings));
					
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
					
					xhttp.dummy.open("GET", "dataHandler.php", true);
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
				if(this.readyState == 4 && this.status == 200)
				{
					//Radar Codes
					returnVal = JSON.parse(this.responseText);
					
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
					delete xhttp.dropdowns;
				}
			}

			xhttp.dropdowns.open("GET", "dataHandler.php?type=settings&dropdown=general", true);
			xhttp.dropdowns.send();
		}
		
		//Set up theme card
		xhttp.theme = new XMLHttpRequest();
		xhttp.theme.onreadystatechange = function()
		{
			if(this.readyState == 4 && this.status == 200)
			{
				returnVal = JSON.parse(this.responseText);
				target = document.getElementById('selectedThemeCardBody');
				target.style.textAlign = "center";
				
				target.innerHTML = "";
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
				delete xhttp.theme;
			}
		}
		
		xhttp.theme.open("GET", "dataHandler.php?type=settings&dropdown=theme", true);
		xhttp.theme.send();
		
		break;
		
		case 8:
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
				if(this.readyState == 4 && this.status == 200)
				{
					//General System Information
					sysInfo = JSON.parse(this.responseText);
					
					target = document.getElementById('sysCardBody');
					if(sysInfo.sysData.length == 0)
					{
						target.parentElement.parentElement.nextSibling.remove();
						target.parentElement.parentElement.remove();
					}
					else
					{
						target.innerHTML = "";
						sysInfo.sysData.forEach((sysValue) => {renderLeftRightLine(target, sysValue.name, sysValue.value);});
					}
					
					//Temp Info
					target = document.getElementById('sysTempCardBody');
					if(sysInfo.tempData.length == 0)
					{
						target.parentElement.parentElement.nextSibling.remove();
						target.parentElement.parentElement.remove();
					}
					else
					{
						target.innerHTML = "";
						sysInfo.tempData.forEach((tempValue) => {renderLeftRightLine(target, tempValue.name, tempValue.value);});
					}
					
					//SatDump Info
					if(config.showSatdumpInfo)
					{
						target = document.getElementById('satDumpInfoCardBody');
						if(sysInfo.satdumpData.length == 0) target.innerHTML = "<div style='text-align: center;'>SatDump Statistics Unavailable!</div>";
						else
						{
							target.innerHTML = "";
							sysInfo.satdumpData.forEach((value) => {
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
					
					delete xhttp.sysInfo;
					
					//Fix style based on number of cards
					if(mainContent.childElementCount <= 2) mainContent.className = "singleCard";
					else if(mainContent.childElementCount <= 4) mainContent.className = "dualCard";
					else mainContent.className = "mainContent";
				}
			}
			
			xhttp.sysInfo.open("GET", "dataHandler.php?type=metadata&id=sysInfo", true);
			xhttp.sysInfo.send();
		}
		
		break;
	}
	
	//Change styling for specific screens
	if(mainContent.childElementCount <= 2) mainContent.className = "singleCard";
	else if(mainContent.childElementCount <= 4) mainContent.className = "dualCard";
	else mainContent.className = "mainContent";
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
		
		if(selectedMenu == 8) loadStats(event.currentTarget.nextSibling);
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
			if(this.readyState == 4 && this.status == 200)
			{
				metadata = JSON.parse(this.responseText);
				if(Object.keys(metadata).length == 0)
				{
					targetedContent.innerHTML = "<i>Error loading statistics</i>";
				}
				else
				{
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
				
				delete xhttp.loadStats;
			}
		}
		
		xhttp.loadStats.open("GET", "dataHandler.php?type=metadata&id=" + targetedContent.id, true);
		xhttp.loadStats.send();
	}
}
function loadLocalRadar(targetedContent, metadata)
{
	targetedContent.innerHTML = "";
	goesImg = document.createElement('img');
	goesImg.className = "goesimg";
	goesImg.id = 'lightbox-localRadar';
	goesImg.src = "/dataHandler.php?type=localRadarData&timestamp=" + metadata[metadata.length - 1]['timestamp'];
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
	metadata.forEach(thisImg => {dynamicEl.push({src: "/dataHandler.php?type=localRadarData&timestamp=" + thisImg['timestamp'], subHtml: thisImg['subHtml'], timestamp: thisImg['timestamp']});});
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
function loadHurricane(targetedContent, id, product, metadata)
{
	targetedContent.innerHTML = "";
	goesImg = document.createElement('img');
	goesImg.className = "goesimg";
	goesImg.id = "lightbox-" + product + id;
	goesImg.src = "/dataHandler.php?type=hurricaneData&id=" + id + "&product=" + product + "&timestamp=" + metadata[metadata.length - 1]['timestamp'];
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
	metadata.forEach(thisImg => {dynamicEl.push({src: "/dataHandler.php?type=hurricaneData&id=" + id + "&product=" + product + "&timestamp=" + thisImg['timestamp'], subHtml: thisImg['subHtml'], timestamp: thisImg['timestamp']});});
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
		if(this.readyState == 4 && this.status == 200)
		{
			metadata = JSON.parse(this.responseText);
			loadImage(targetedContent, metadata);
			delete xhttp.loadImage;
		}
	}
	
	xhttp.loadImage.open("GET", "dataHandler.php?type=" + imageType + "Metadata&id=" + targetedContent.id.replace('Content', ''), true);
	xhttp.loadImage.send();
}
function loadImage(targetedContent, metadata)
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
	goesImg.src = "/dataHandler.php?type=" + imageType + "Data&id=" + contentId + "&timestamp=" + metadata[metadata.length - 1]['timestamp'];
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
	metadata.forEach(thisImg => {dynamicEl.push({src: "/dataHandler.php?type=" + imageType + "Data&id=" + contentId + "&timestamp=" + thisImg['timestamp'], description: thisImg['description'], subHtml: thisImg['subHtml'], timestamp: thisImg['timestamp']});});
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
	else me.parentNode.previousSibling.innerHTML = "<video controls loop autoplay playsinline style='width: 100%;'><source src='/videos/" + config[imageType][me.id.replace("-timelapse", "")].videoPath + "' type='video/mp4' /></video>";
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
	
	if(me.id.endsWith("-Recent")) loadLocalRadar(me.parentNode.previousSibling, weatherInfo.localRadarMetadata);
	else
	{
		lightGalleries['lightbox-localRadar'].destroy();
		delete lightGalleries['lightbox-localRadar'];
		me.parentNode.previousSibling.innerHTML = "<video controls loop autoplay playsinline style='width: 100%;'><source src='/videos/" + config.localRadarVideo + "' type='video/mp4' /></video>";
	}
}

window.addEventListener("load", function()
{
	xhttp.preload = new XMLHttpRequest();
	xhttp.preload.onreadystatechange = function()
	{
		if(this.readyState == 4 && this.status == 200)
		{
			try {config = JSON.parse(this.responseText);}
			catch(error)
			{
				renderCollapsingCard("serverError", "The server returned bad data. Click to expand", "prettyBoxContent", "otherEmwinBody");
				target = document.getElementById('serverErrorContent').firstChild;
				target.innerHTML = this.responseText;
				mainContent.className = "singleCard";
				return;
			}

			if(config.showEmwinInfo) renderMenuItem(0, 'cloud', 'Current Weather');
			if(Object.keys(config.abi).length > 0) renderMenuItem(1, 'globe-americas', 'Full Disk');
			if(Object.keys(config.l2).length > 0) renderMenuItem(2, 'atom', 'Level 2 Graphics');
			if(Object.keys(config.meso).length > 0) renderMenuItem(3, 'search-plus', 'Mesoscale Imagery');
			if(Object.keys(config.emwin).length > 0) renderMenuItem(4, 'image', 'EMWIN Imagery');
			if(config.showAdminInfo || config.showEmwinInfo) renderMenuItem(5, 'align-left', 'Other EMWIN');
			if(config.showEmwinInfo) renderMenuItem(6, 'wind', 'Hurricane Center');
			renderMenuItem(7, 'cogs', 'Local Settings');
			if(config.showGraphs || config.showSysInfo) renderMenuItem(8, 'info-circle', 'System Info');
	
			menuSelect(selectedMenu);
			delete xhttp.preload;
		}
	}
	
	xhttp.preload.open("GET", "dataHandler.php?type=preload", true);
	xhttp.preload.send();
});
