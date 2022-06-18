//Global variables
var sideBar = false;
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
function renderImageCard(slug)
{
	card = document.createElement('div');
	card.className = "prettyBox";
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
	if(expandedCards.includes(slug + "Content")) loadImage(content);
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
	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function()
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
		}
	}

	xhttp.open("GET", "dataHandler.php?type=settings&dropdown=wxZone&orig=" + orig, true);
	xhttp.send();
}
function getLocations(rwrOrig)
{
	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function()
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
		}
	}
	
	xhttp.open("GET", "dataHandler.php?type=settings&dropdown=city&rwrOrig=" + rwrOrig, true);
	xhttp.send();
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
		mainContent.innerHTML = "<div style='height: 30px;'></div><div style='color: white; text-align: center;'>No data found to display! Please verify the server config</div>";
		mainContent.className = "mainContent singleCard";
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
		mainContent.innerHTML = "<div style='height: 30px;'></div><div style='color: white; text-align: center;'>Sorry! Internet Explorer does not support this site. Please use a real browser.</div>";
		mainContent.className = "mainContent singleCard";
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
		loadLocalRadar(target);
		
		//AJAX load weather information
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function()
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
				
				//Weather Conditions
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
					case "LGT SNOW": conditions = "Light Snow"; break;
					case "LGT RAIN": conditions = "Light Rain"; break;
					case "RAIN": conditions = "Rain"; break;
					case "HVY RAIN": conditions = "Heavy Rain"; break;
					case "SNOW": conditions = "Snow"; break;
					case "FAIR": conditions = "Fair"; break;
					case "TSTM": conditions = "Thunderstorms"; break;
				}
				
				//Render Weather Card
				target = document.getElementById("currentWeatherCardBody");
				target.previousSibling.innerHTML += " - " + toTitleCase(weatherInfo.city) + ", " + weatherInfo.state;
				target.innerHTML = "";
				
				renderLeftRightLine(target, "Weather", conditions);
				renderLeftRightLine(target, "Temperature", weatherInfo.temp + "&deg; F");
				renderLeftRightLine(target, "Humidity", weatherInfo.humidity + "%");
				renderLeftRightLine(target, "Dew Point", weatherInfo.dewPoint + "&deg; F");
				renderLeftRightLine(target, "Barometric Pressure", weatherInfo.pressure);
				renderLeftRightLine(target, "Wind", (weatherInfo.wind == 0 ? "" : weatherInfo.windDirection + ", ") + weatherInfo.wind + " MPH");
				if(weatherInfo.windGust != "N/A") renderLeftRightLine(target, "Wind Gust", weatherInfo.windGust);
				if(weatherInfo.remarks != "") renderLeftRightLine(target, "Remarks", weatherInfo.remarks);
				
				target.innerHTML += "<div class='goeslabel'>Last Update: " + weatherInfo.weatherTime + "</div>";
				
				//Weather Summary
				document.getElementById("summaryWeatherCardBody").innerHTML = weatherInfo.summary + "<div class='goeslabel'>Last Update: " + weatherInfo.summaryTime + "</div>";
				
				//7 day forcast
				target = document.getElementById("sevenDayWeatherCardBody");
				target.innerHTML = "";
				sevenDayForcastContainer = document.createElement('div');
				sevenDayForcastContainer.className = "forcastCardHolder";
				
				weatherInfo.sevenDayForcast.forEach(todaysForcast => {
					forcastCard = document.createElement('div');
					forcastCard.className = 'forecastCard';
					forcastCard.innerHTML = "<div style='font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #888888;'>" + todaysForcast.date + "</div>";
					
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
					
					if((("amClouds" in todaysForcast && "amPrecip" in todaysForcast) || "maxTemp" in todaysForcast || "amPrecip" in todaysForcast || "amHumidity" in todaysForcast) && (("pmClouds" in todaysForcast && "pmPrecip" in todaysForcast) || "minTemp" in todaysForcast || "pmPrecip" in todaysForcast || "pmHumidity" in todaysForcast)) forcastCard.innerHTML += "<div style='font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #888888; margin-top: 25px;'>Evening</div>";
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
				
				
				//Forecast
				target = document.getElementById("forecastWeatherCardBody");
				target.previousSibling.innerHTML += " - " + toTitleCase(weatherInfo.city) + ", " + weatherInfo.state;
				target.innerHTML = "";
				Object.keys(weatherInfo.forecast).forEach((key) => {target.innerHTML += "<p><b>" + key + ": </b>" + weatherInfo.forecast[key] + "</p>";});
				target.innerHTML += "<div class='goeslabel'>Last Update: " + weatherInfo.forecastTime + "</div>";
			}
		}
		
		xhttp.open("GET", "dataHandler.php?type=weatherJSON", true);
		xhttp.send();
		
		//AJAX load alerts
		xhttp2 = new XMLHttpRequest();
		xhttp2.onreadystatechange = function()
		{
			if(this.readyState == 4 && this.status == 200)
			{
				alertInfo = JSON.parse(this.responseText);
				
				//Weather Warnings
				alertInfo.weatherWarnings.forEach(function(element){renderAlert(element, "red")});
				alertInfo.localEvacuations.forEach(function(element){renderAlert(element, "brown")});
				alertInfo.localEmergencies.forEach(function(element){renderAlert(element, "red")});
				alertInfo.blueAlerts.forEach(function(element){renderAlert(element, "blue")});
				alertInfo.amberAlerts.forEach(function(element){renderAlert(element, "amber")});
				alertInfo.civilDangerWarnings.forEach(function(element){renderAlert(element, "purple")});
			}
		}
		xhttp2.open("GET", "dataHandler.php?type=alertJSON", true);
		xhttp2.send();
		break;
		
		case 1:
		barTitle.innerHTML = "Full Disk";
		mainContent.innerHTML = "";
		Object.keys(config.abi).forEach(function(key){renderImageCard(key);});
		break;
		
		case 2:
		barTitle.innerHTML = "Level 2 Imagery";
		mainContent.innerHTML = "";
		Object.keys(config.l2).forEach(function(key){renderImageCard(key);});
		break;
		
		case 3:
		barTitle.innerHTML = "Mesoscale Imagery";
		mainContent.innerHTML = "";
		Object.keys(config.meso).forEach(function(key){renderImageCard(key);});
		break;

		case 4:
		barTitle.innerHTML = "EMWIN Imagery";
		mainContent.innerHTML = "";
		Object.keys(config.emwin).forEach(function(key){renderImageCard(key);});
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
		
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function()
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
					adminMessageLastUpdate.innerHTML = "Last Broadcast: " + otherEmwinInfo.latestAdminDate;
					target.parentElement.appendChild(adminMessageLastUpdate);
				}
			}
		}
		xhttp.open("GET", "dataHandler.php?type=metadata&id=otherEmwin", true);
		xhttp.send();
		break;
		
		case 6:
		barTitle.innerHTML = "Configure Location";
		mainContent.innerHTML = "";
		
		renderStiffCard("selectedProfile", "Location Settings Profile");
		
		selectedProfile = parseInt(getCookie('selectedProfile'));
		currentSettings = JSON.parse(getCookie('currentSettings'));
		profileSelectorHolder = document.createElement('div');
		profileSelectorHolder.className = 'prettyBoxList';
		profileSelectorHolder.style.padding = 0;
		profileSelectorHolder.style.paddingBottom = "10px";
		profileSelectorHolder.style.textAlign = 'center';
		profileSelectorHolder.innerHTML = "<b>Profile: </b>";
		
		profileSelector = document.createElement('select');
		profileSelector.id = 'profileSelector';
		thisProfile = 0;
		currentSettings.forEach(profile => {
			newOption = document.createElement('option');
			newOption.value = thisProfile;
			newOption.text = (thisProfile == 0 ? "Ground Station Defaults" : toTitleCase(profile.city) + ", " + profile.stateAbbr);
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
				xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function()
				{
					if(this.readyState == 4 && this.status == 200)
					{
						//Request complete; reload settings view
						if(currentSettings[selectedProfile].radarCode != lastRadarCode) location.reload();
						else menuSelect(selectedMenu);
					}
				}
				
				xhttp.open("GET", "dataHandler.php", true);
				xhttp.send();
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
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function()
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
			}
		}

		xhttp.open("GET", "dataHandler.php?type=settings&dropdown=general", true);
		xhttp.send();
		break;
		
		case 7:
		barTitle.innerHTML = "System Info";
		mainContent.innerHTML = "";
		
		if(config.showSysInfo)
		{
			renderStiffCard("sys", "System Info");
			renderStiffCard("sysTemp", "System Temps");
			
			//AJAX load system information
			xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function()
			{
				if(this.readyState == 4 && this.status == 200)
				{
					sysInfo = JSON.parse(this.responseText);
					target = document.getElementById('sysCardBody');
					
					target.innerHTML = "";
					renderLeftRightLine(target, "OS Version", sysInfo['osVersion']);
					renderLeftRightLine(target, "Kernel Version", sysInfo['kernelVersion']);
					renderLeftRightLine(target, "Goestools Version", sysInfo['goestoolsVersion']);
					renderLeftRightLine(target, "Uptime", sysInfo['uptime']);
					renderLeftRightLine(target, "Goesrecv Status", sysInfo['goesrecvStatus']);
					renderLeftRightLine(target, "CPU Load (1min, 5min, 15min)", sysInfo['cpuLoad']);
					renderLeftRightLine(target, "Memory Used", sysInfo['memUsage']);
					renderLeftRightLine(target, "Disk Used", sysInfo['diskUsage']);
					if("powerStatus" in sysInfo) renderLeftRightLine(target, "Power Status", sysInfo['powerStatus']);
					if("batteryPercentage" in sysInfo) renderLeftRightLine(target, "Battery", sysInfo['batteryPercentage'] + "%");

					target = document.getElementById('sysTempCardBody');
					target.innerHTML = "";
					sysInfo.tempData.forEach((tempValue) => {renderLeftRightLine(target, tempValue.name, tempValue.value);});
				}
			}
			
			xhttp.open("GET", "dataHandler.php?type=metadata&id=sysInfo", true);
			xhttp.send();
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
		break;
	}
	
	//Change styling for specific screens
	if(mainContent.childElementCount <= 2) mainContent.className = "mainContent singleCard";
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
		
		if(selectedMenu == 7) loadStats(event.currentTarget.nextSibling);
		else loadImage(event.currentTarget.nextSibling);
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
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function()
		{
			if(this.readyState == 4 && this.status == 200)
			{
				metadata = JSON.parse(this.responseText);
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
		}
	}
	
	xhttp.open("GET", "dataHandler.php?type=metadata&id=" + targetedContent.id, true);
	xhttp.send();
}
function loadLocalRadar(targetedContent)
{
	if(targetedContent.innerHTML == "Loading, please wait...")
	{
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function()
		{
			if(this.readyState == 4 && this.status == 200)
			{
				metadata = JSON.parse(this.responseText);
				targetedContent.innerHTML = "";
				goesImg = document.createElement('img');
				goesImg.className = "goesimg";
				goesImg.id = 'lightbox-localRadar';
				goesImg.src = "/dataHandler.php?type=localRadarData&timestamp=" + metadata[metadata.length - 1]['timestamp'];
				goesImg.addEventListener('click', function(event){window[event.target.id].openGallery(window[event.target.id].galleryItems.length - 1);});
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
				metadata.forEach(thisImg => {dynamicEl.push({src: "/dataHandler.php?type=localRadarData&timestamp=" + thisImg['timestamp'], subHtml: thisImg['subHtml']});});
				window['lightbox-localRadar'] = lightGallery(goesImg, {
					plugins: [lgZoom],
					dynamic: true,
					speed: (matchMedia('(hover: none)').matches ? 250 : 0),
					dynamicEl: dynamicEl
				});
			}
		}
		
		xhttp.open("GET", "dataHandler.php?type=localRadarMetadata", true);
		xhttp.send();
	}
}
function loadImage(targetedContent)
{
	if(targetedContent.innerHTML == "Loading, please wait...")
	{
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function()
		{
			if(this.readyState == 4 && this.status == 200)
			{
				metadata = JSON.parse(this.responseText);
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
				goesImg.addEventListener('click', function(event){window[event.target.id].openGallery(window[event.target.id].galleryItems.length - 1);});
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
				metadata.forEach(thisImg => {dynamicEl.push({src: "/dataHandler.php?type=" + imageType + "Data&id=" + contentId + "&timestamp=" + thisImg['timestamp'], subHtml: thisImg['subHtml']});});
				window['lightbox-' + contentId] = lightGallery(goesImg, {
					plugins: [lgZoom],
					dynamic: true,
					speed: (matchMedia('(hover: none)').matches ? 250 : 0),
					dynamicEl: dynamicEl
				});
			}
		}
		
		xhttp.open("GET", "dataHandler.php?type=" + imageType + "Metadata&id=" + targetedContent.id.replace('Content', ''), true);
		xhttp.send();
	}
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
		me.parentNode.previousSibling.innerHTML = "Loading, please wait...";
		loadImage(me.parentNode.previousSibling);
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
	
	if(me.id.endsWith("-Recent"))
	{
		me.parentNode.previousSibling.innerHTML = "Loading, please wait...";
		loadLocalRadar(me.parentNode.previousSibling);
	}
	else me.parentNode.previousSibling.innerHTML = "<video controls loop autoplay playsinline style='width: 100%;'><source src='/videos/" + config.localRadarVideo + "' type='video/mp4' /></video>";
}

window.addEventListener("load", function()
{
	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function()
	{
		if(this.readyState == 4 && this.status == 200)
		{
			config = JSON.parse(this.responseText);

			if(config.showEmwinInfo) renderMenuItem(0, 'cloud', 'Current Weather');
			if(Object.keys(config.abi).length > 0) renderMenuItem(1, 'globe-americas', 'Full Disk');
			if(Object.keys(config.l2).length > 0) renderMenuItem(2, 'atom', 'Level 2 Graphics');
			if(Object.keys(config.meso).length > 0) renderMenuItem(3, 'search-plus', 'Mesoscale Imagery');
			if(Object.keys(config.emwin).length > 0) renderMenuItem(4, 'image', 'EMWIN Imagery');
			if(config.showAdminInfo || config.showEmwinInfo) renderMenuItem(5, 'align-left', 'Other EMWIN');
			if(config.showEmwinInfo) renderMenuItem(6, 'cogs', 'Configure Location');
			if(config.showGraphs || config.showSysInfo) renderMenuItem(7, 'info-circle', 'System Info');
	
			menuSelect(selectedMenu);
		}
	}
	
	xhttp.open("GET", "dataHandler.php?type=preload", true);
	xhttp.send();
});
