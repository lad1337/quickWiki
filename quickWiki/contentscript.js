/*
	Developer : Dennis Lutter (lad1337@gmail.com)
	Date : 28/01/2011

    This file is part of Google Wikie Chrome Extension(= GoogleWiki).

    GoogleWiki is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    GoogleWiki is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with GoogleWiki.  If not, see <http://www.gnu.org/licenses/>.
*/
Object.prototype.foreach = function( callback ) {
  for( var k in this ) {
    if( typeof this[ k ] != 'function' ) {
      callback( k, this[ k ] );
    }
  }
}
function scrollToSection(){
	
	var anchor = this.getAttribute('href');
	anchor = anchor.substring(1);
	if(anchor == 'mw-head')
		anchor = 'toc';
	var ypos= document.getElementById(anchor).offsetTop;
	log(1,"scrolling to id: '"+anchor+ "' wich has a posittion of Y-"+ypos);
	window.scrollTo(0,ypos);
	return false;
}

function onMsg(msg){
	//alert("message type: "+msg.t);
	if(msg.t == 'article'){
		onArticle(msg.data, msg.lang);
	}else if(msg.t == 'banner'){
		onBanner(msg.data, msg.articleNumber,msg.lang);
	}else if(msg.t == 'status'){
		onStatus(msg.data);
	}else if(msg.t == 'config'){
		onConfig(msg.data);
	}else if(msg.t == 'error'){
		if(debug >= 1)
			alert(msg.data);
		log(1,msg.data);
	}else if(msg.t == 'log'){
		log(1,msg.data);
	}else{
		alert("unknown msg type");	
	}
}

function onConfig(langList){
	languageList = langList;
}

function onBanner(data, articleNumber ,lang) {
	selectedLanguage = lang;
	log(1,"building banner-thing");
    var banner = document.createElement('div');
    var title_dom = document.createElement('strong');
    var title_domWrapper = document.createElement('div');
    var link_domWrapper = document.createElement('div');
    var seachedText = document.createElement('a');
    var breaker = document.createElement('br');
    
    seachedText.innerText = data.query.search[articleNumber].title;
	seachedText.setAttribute('href','#');
	seachedText.setAttribute('title',data.query.search[articleNumber].title);
	seachedText.setAttribute('onClick', 'return false;');
	seachedText.addEventListener('click',getMeArticle,false);
    
    
	breaker.style.clear = 'both';
    title_dom.innerText = 'Results for ';
    title_dom.appendChild(seachedText);
    
    title_domWrapper.appendChild(title_dom);
    title_domWrapper.id = 'disambiguationHeader';
    banner.appendChild(title_domWrapper);
    banner.id = 'disambiguation';
    link_domWrapper.id = 'linkWrapper';
	var lenght = 5;
	if(data.query.search.length < lenght)
		lenght = data.query.search.length;
		
	for (i=1;i<lenght;i++){
		var a = document.createElement('a');
  		a.innerText = data.query.search[i].title;
  		a.setAttribute('href','#');
  		a.setAttribute('title',data.query.search[i].title);
  		a.setAttribute('onClick', 'return false;');
  		a.addEventListener('click',getMeArticle,false);
  		link_domWrapper.appendChild(a);
	}
	
    banner.appendChild(link_domWrapper);
    banner.appendChild(breaker);
    
    var size = document.createElement('div');
    var expand = document.createElement('a');
    var reduce = document.createElement('a');
    size.id = 'googlePediaSizeControllerWrapper';
    
    expand.setAttribute('href','#');
    expand.setAttribute('onClick','return false;');
    expand.addEventListener('click',expandMe,false);
    expand.innerText = '<< ';
    
    reduce.setAttribute('href','#');
    reduce.setAttribute('onClick','return false;');
    reduce.addEventListener('click',reduceMe,false);
    reduce.innerText = ' >>';
    reduce.style.color = 'grey';
    
    size.appendChild(expand);
    size.appendChild(reduce);
    banner.appendChild(size);
    
    googlePediaWrapper.replaceChild(banner, googlePediaWrapper.firstChild);
}

function expandMe(){
	this.style.color = 'grey';
	document.getElementById('googlePediaSizeControllerWrapper').lastChild.style.color = '#000';
	log(1,"expending from "+googlePediaWrapper.style.width+" to 100%");
	googlePediaWrapper.style.width = '100%';
	document.getElementById('res').style.width = '0px';
	document.getElementById('res').style.heigth = '0px';
}

function reduceMe(){
	this.style.color = 'grey';
	document.getElementById('googlePediaSizeControllerWrapper').firstChild.style.color = '#000';
	log(1,"reduceing from "+googlePediaWrapper.style.width+" to 45%");
	googlePediaWrapper.style.width = '45%';
	document.getElementById('res').style.width = '52%';
	document.getElementById('res').style.heigth = 'auto';
}


function onArticle(data){
	var article = buildArticle(data);

   	googlePediaWrapper.replaceChild(article, googlePediaWrapper.lastChild);
}

function buildArticle(data){
	
	log(1,"building article");
	var temp = document.createElement('div');
	temp.innerHTML = data;
	var article;
	for (var i = 0; i < temp.childNodes.length; i++)
	{
	   if (temp.childNodes[i].id == 'content')
	   {
	       article = temp.childNodes[i];
	       article.id = 'googlePediaContent';
	       break;
	   }
	}
	
	article.id = 'googlePediaContent';
	var languageString = languageList[selectedLanguage];
	
	// fixing links we will
	var links = article.getElementsByTagName('a');
	for (i=0;i<links.length;i++){
		var link = links[i].getAttribute('href');
		if(link != null){
			var posRaute = link.search(/#.+/); // an anchor
			//var posFile = link.search(/File:.+/i); // a wiki file
			//var posDatei = link.search(/Datei:.+/i); // a wiki file
			var posFile = link.search(/:.+/i); // a wiki file
			var posWWW = link.search(/www.+/i); // external link
			log(3,"link: "+link+"-- positionRaute: "+posRaute+"; posFile: "+posFile);
			if(posRaute == -1 && posWWW == -1 && posFile == -1)// if -># was not found in the link fix it, otherwise there is nothing to do
				links[i].setAttribute('href','http://www.google.de/search?q='+link.substring(6).replace(/_/g, ' '));
			else if(posRaute == -1 && posWWW == -1)
				links[i].setAttribute('href','http://'+languageString+'.wikipedia.org'+link);
			else if(posWWW != -1){
				log(3,"external link: "+link);
				links[i].setAttribute('href',link);
			}else if(posRaute != -1){
				links[i].setAttribute('onClick','return false;');
				links[i].addEventListener('click',scrollToSection,false);
			}
		}
	}
	
	/*
	// this button media relink thins is harder then i thought
	var buttons = article.getElementsByTagName('button');
	for (i=0;i<buttons.length;i++){
		var oldOnClick = buttons[i].getAttribute("onClick");
		var newOnClick = oldOnClick.replace(/\/wiki\//,'http://'+languageString+".wikipedia.org/wiki/");
		alert(newOnClick);
		log(3,"button onclick: "+oldOnClick);
	}
	*/
	
	var heading = article.getElementsByTagName('h1')[0].cloneNode(true);
	var headingLink = document.createElement('a');
	headingLink.setAttribute('href','http://'+languageString+'.wikipedia.org/wiki/'+heading.innerText);
	
	headingLink.appendChild(heading);

   	article.replaceChild(headingLink, article.getElementsByTagName('h1')[0]);
	
	
	
	// TODO: relink the images	
	// TODO: relink the imageMaps -.- but this should bei like the links but only for the <area> tag
	/*
	var imgs = article.getElementsByTagName('img');
	for (i=0;i<imgs.length;i++){
		var img = imgs[i].src;
		if(img != null){
			// this aproach dosnt work since the src has always a http even if its pointing to google 
			var anchor = img.search(/http/);
			log("link: "+img+"-- anchor: "+anchor);
			if(anchor == -1)// if ->http was not found in the src fix it, otherwise there is nothing to do
				// TODO: not the static en.wikipedia.org
				imgs[i].setAttribute('src','http://en.wikipedia.org'+src);
				//links[i].setAttribute('href','http://en.wikipedia.org'+link);
		}
	}
	*/
	return article;
}


function onStatus(status){
	if(status = 'nothingFound'){
	   	var tmpContentDiv = document.createElement('div');
	   	var tmpDisambiguationDiv = document.createElement('div');
	   	tmpContentDiv.id = "googlePediaContent";
		tmpDisambiguationDiv.id = "disambiguation";
		tmpContentDiv.innerHTML = "Nothing Found";
		
    	googlePediaWrapper.replaceChild(tmpDisambiguationDiv, googlePediaWrapper.firstChild);
   		googlePediaWrapper.replaceChild(tmpContentDiv, googlePediaWrapper.lastChild);
	
	}
}


function getMeArticle(){
	var articleNameString = this.getAttribute('title');
	log(1,"getting article: "+articleNameString+" with language: "+ selectedLanguage);
	port.postMessage({t: 'onlyAricle', articleName: articleNameString , lang: selectedLanguage});
}

function getMeEverything(){
	searchThis = getSearchstring();
	log(1,"searching for articles: "+searchThis);
	port.postMessage({t: 'all',searchString: searchThis});
}

function getSearchstring(){	
	var end = document.title.search(/ - Google/i);
	// TDOD: get a better hold of the search string
	// deactivated the searchfield.value thing because it gives "off" back if instand search is on .. oO
	var searchThisTmp;
	/*
	if(searchField.value != "" && false){
		searchThisTmp = searchField.value;
	}else{
		searchThisTmp = document.title.substring(0,end);
	}
	*/
	searchThisTmp = document.title.substring(0,end);
	log(3,"searchString: "+searchThisTmp);
	return searchThisTmp;
}




// get the divs from google and style them allready
// will call itself trough setInterval if it can not initialise because of the wrong page ... aka landingpage
// if it is on the correct page searchCecker will be called trough an setInterval
function init(){
	log(2,"testing page…");
	if(document.getElementById("center_col") != null){
		log(1,"element center_col was found! initiating…");
		window.clearInterval(readyCheckerInterval);
		
		//the port
		port = chrome.extension.connect({name: "googlePedia"});
		port.onMessage.addListener(onMsg);
		port.postMessage({t: 'getConfig'});

		prepareDOM();
		getMeEverything();
		searchCheckerInterval = window.setInterval("searchChecker()", 1000);
	}else if(readyCheckerIntervalON == false){
		log(2,"fail and starting readyChecker");
		readyCheckerInterval = window.setInterval('readyChecker()', 1000);
	}else{
		log(2,"fail and readyChecker allready running");	
	}
}

// will move the googlePediaWrapper acording to the addiv size only if it has chaged
// is called by init() and searchChecker()
function moveForAd(){
	// we always hav to get the element again to calculate the offset height -.-
	adDiv = document.getElementById('rhs');
    if(adDiv != null){
    	//log("we hav an ad div with a height of: "+adDiv.offsetHeight);
    	var offset = adDiv.offsetHeight + 20;
		googlePediaWrapper.style.marginTop = offset+'px';
    
    }else
    	googlePediaWrapper.style.marginTop = '0px';
    
}



function prepareDOM(){
	
	title = document.title;
	googlePediaWrapper = document.createElement('div');
   	var breaker = document.createElement('br');
   	var tmpContentDiv = document.createElement('div');
   	var tmpDisambiguationDiv = document.createElement('div');
   	
    goolgeResultsWrapper = document.getElementById("center_col");
    goolgeResults = document.getElementById("res");
	adDiv = document.getElementById('rhs');
    
    //ads
    moveForAd();
	
	goolgeResultsWrapper.style.marginRight = '0px';
	breaker.style.clear = 'both';
	
	//atributes
	googlePediaWrapper.id = "googlePedia";
	tmpContentDiv.id = "googlePediaContent";
	tmpContentDiv.innerHTML = "LOADING...";
	tmpDisambiguationDiv.id = "disambiguation";
	//append
	
	goolgeResultsWrapper.appendChild(googlePediaWrapper);
   	googlePediaWrapper.appendChild(tmpDisambiguationDiv); // adding an empty div so we can later call replaceChild()
	googlePediaWrapper.appendChild(tmpContentDiv); // adding an empty div so we can later call replaceChild()
   	goolgeResultsWrapper.appendChild(breaker);
	
	/*
	var blupp = document.getElementById('tsf').getElementsByTagName("input");
	searchField = blupp[3];
	
	//document.getElementById('tsf').addEventListener('onchange',searchChecker,false);
	searchField.addEventListener('onchange',searchChecker,false);
	searchField.setAttribute('ulu','mulu');
	*/

}

function log(lvl,msg){
	if(lvl <= debug && debug != 0)
		console.log("googlePedia - "+this+" : "+msg);	
}


// interval functions !
function readyChecker(){
	readyCheckerIntervalON = true;
	init();
}
// kinda the main loop
function searchChecker(){
	// TODO: dont call this every fucking second!!
	moveForAd();
	newSearchString = getSearchstring();
	log(2,"checking: "+searchThis+" vs "+newSearchString);
	if(searchThis != newSearchString){
		getMeEverything();
	}
}

// will output consol msgs
// 0 = off
// 1 = only msgs and events and errors
// 2 = setinterval stuff too and errors wil poduce alerts
// 3 = foreach loop stuff too
var debug = 1;


// leave those like this!
var googlePediaWrapper;
var goolgeResultsWrapper;
var goolgeResults;
var searchThis;
var port;
var title;
var searchField;
var searchCheckerInterval;
var readyCheckerInterval;
var readyCheckerIntervalON = false;
var lastAdHeigt;
var adDiv;
var selectedLanguage;
var languageList;

init();
