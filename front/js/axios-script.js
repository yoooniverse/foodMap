/*
๐ก 1.   ์ง๋ ์์ฑ & ํ๋ ์ถ์ ์ปจํธ๋กค๋ฌ

1. ๋๋ฏธ๋ฐ์ดํฐ ์ค๋นํ๊ธฐ (์ ๋ชฉ, ์ฃผ์, url, ์นดํ๊ณ ๋ฆฌ)
2. ์ฌ๋ฌ๊ฐ ๋ง์ปค ์ฐ๊ธฐ
    - ์ฃผ์ - ์ขํ ๋ณํ
3. ๋ง์ปค์ ์ธํฌ์๋์ฐ ๋ถ์ด๊ธฐ
    - ๋ง์ปค์ ํด๋ฆญ ์ด๋ฒคํธ๋ก ์ธํฌ์๋์ฐ
    - url์์ ์ฌ๋ค์ผ ๋ฐ๊ธฐ
    - ํด๋ฆญํ ๋ง์ปค๋ก ์ง๋ ์ผํฐ ์ด๋
4. ์นดํ๊ณ ๋ฆฌ ๋ถ๋ฅ
*/


var mapContainer = document.getElementById('map'), // ์ง๋๋ฅผ ํ์ํ  div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.54, 126.96), // ์ง๋์ ์ค์ฌ์ขํ
        level: 8 // ์ง๋์ ํ๋ ๋ ๋ฒจ
    };

var map = new kakao.maps.Map(mapContainer, mapOption); // ์ง๋๋ฅผ ์์ฑํฉ๋๋ค

// // ์ผ๋ฐ ์ง๋์ ์ค์นด์ด๋ทฐ๋ก ์ง๋ ํ์์ ์ ํํ  ์ ์๋ ์ง๋ํ์ ์ปจํธ๋กค์ ์์ฑํฉ๋๋ค
// var mapTypeControl = new kakao.maps.MapTypeControl();

// // ์ง๋์ ์ปจํธ๋กค์ ์ถ๊ฐํด์ผ ์ง๋์์ ํ์๋ฉ๋๋ค
// // kakao.maps.ControlPosition์ ์ปจํธ๋กค์ด ํ์๋  ์์น๋ฅผ ์ ์ํ๋๋ฐ TOPRIGHT๋ ์ค๋ฅธ์ชฝ ์๋ฅผ ์๋ฏธํฉ๋๋ค
// map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// ์ง๋ ํ๋ ์ถ์๋ฅผ ์ ์ดํ  ์ ์๋  ์ค ์ปจํธ๋กค์ ์์ฑํฉ๋๋ค
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);




/*๋๋ฏธ๋ฐ์ดํฐ*/
async function getDataSet(category) {
	let qs = category;
	if (!qs) {
		qs = "";
	}

	const dataSet = await axios({
		method: "get",
		url: `http://3.36.204.107:3000/restaurants?category=${qs}`,
		header: {},
		data: {},
	});
	return dataSet.data.result;
}

getDataSet();


/*
**********************************************************
3. ์ฌ๋ฌ๊ฐ ๋ง์ปค ์ฐ๊ธฐ
  * ์ฃผ์ - ์ขํ ๋ณํ
https://apis.map.kakao.com/web/sample/multipleMarkerImage/ (์ฌ๋ฌ๊ฐ ๋ง์ปค)
https://apis.map.kakao.com/web/sample/addr2coord/ (์ฃผ์๋ก ์ฅ์ ํ์ํ๊ธฐ)
*/

// ์ฃผ์-์ขํ ๋ณํ ๊ฐ์ฒด๋ฅผ ์์ฑํฉ๋๋ค
var geocoder = new kakao.maps.services.Geocoder();


/*์ฃผ์์ขํ ๋ณํ ํจ์*/
function getCoordsByAddress(address) {
	return new Promise((resolve, reject) => {
		// ์ฃผ์๋ก ์ขํ๋ฅผ ๊ฒ์ํฉ๋๋ค
		geocoder.addressSearch(address, function(result, status) {
			// ์ ์์ ์ผ๋ก ๊ฒ์์ด ์๋ฃ๋์ผ๋ฉด
			if (status === kakao.maps.services.Status.OK) {
				var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
				resolve(coords);
				return;
			}
			reject(new Error("getCoordsByAddress Error : not valid Address"));
		}
		);
	});
}

/* 
******************************************************************************
4. ๋ง์ปค์ ์ธํฌ์๋์ฐ ๋ถ์ด๊ธฐ
  * ๋ง์ปค์ ํด๋ฆญ ์ด๋ฒคํธ๋ก ์ธํฌ์๋์ฐ https://apis.map.kakao.com/web/sample/multipleMarkerEvent/
  * url์์ ์ฌ๋ค์ผ ๋ฐ๊ธฐ
  * ํด๋ฆญํ ๋ง์ปค๋ก ์ง๋ ์ผํฐ ์ด๋ https://apis.map.kakao.com/web/sample/moveMap/
*/

function getContent(data) {
	//์ ํ๋ธ ์ธ๋ค์ผ id ๊ฐ์ ธ์ค๊ธฐ
	let replaceUrl = data.videoUrl;
	let finUrl = "";
	replaceUrl = replaceUrl.replace("https://youtu.be/", "");
	replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", "");
	replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", "");
	finUrl = replaceUrl.split("&")[0];

	replaceUrl = replaceUrl.replace("")
	//์ธํฌ์๋์ฐ ๊ฐ๊ณตํ๊ธฐ
	return `
	<div class="infowindow">
        <div class="infowindow-img-container">
            <img src="https://img.youtube.com/vi/${finUrl}/mqdefault.jpg"
                class="infowindow-img">
        </div>
        <div class="infowindow-body">
            <h5 class="infowindow-title">${data.title}</h5>
            <p class="infowindow-address">${data.address}</p>
            <a href="${data.videoUrl}" class="infowindow-btn" target="_blank">์์์ด๋</a>
        </div>
    </div>
	`;
}

async function setMap(dataSet) {

	// let infowindowArray = [];
	// let markerArray = [];
	markerArray = [];
	infowindowArray = [];


  	for (var i = 0; i < dataSet.length; i++) {
    	// ๋ง์ปค๋ฅผ ์์ฑํฉ๋๋ค
    	let coords = await getCoordsByAddress(dataSet[i].address);
    	var marker = new kakao.maps.Marker({
      	map: map, // ๋ง์ปค๋ฅผ ํ์ํ  ์ง๋
      	position: coords, // ๋ง์ปค๋ฅผ ํ์ํ  ์์น
    	});

		markerArray.push(marker);

    	// ๋ง์ปค์ ํ์ํ  ์ธํฌ์๋์ฐ๋ฅผ ์์ฑํฉ๋๋ค
    	var infowindow = new kakao.maps.InfoWindow({
      	content: getContent(dataSet[i]), // ์ธํฌ์๋์ฐ์ ํ์ํ  ๋ด์ฉ
    	});

		infowindowArray.push(infowindow);

		// ๋ง์ปค์ mouseover ์ด๋ฒคํธ์ mouseout ์ด๋ฒคํธ๋ฅผ ๋ฑ๋กํฉ๋๋ค
		// ์ด๋ฒคํธ ๋ฆฌ์ค๋๋ก๋ ํด๋ก์ ๋ฅผ ๋ง๋ค์ด ๋ฑ๋กํฉ๋๋ค
		// for๋ฌธ์์ ํด๋ก์ ๋ฅผ ๋ง๋ค์ด ์ฃผ์ง ์์ผ๋ฉด ๋ง์ง๋ง ๋ง์ปค์๋ง ์ด๋ฒคํธ๊ฐ ๋ฑ๋ก๋ฉ๋๋ค
		kakao.maps.event.addListener(
		marker,
		"click",
		makeOverListener(map, marker, infowindow, coords)
		);
		kakao.maps.event.addListener(
		map,
		"click",
		makeOutListener(infowindow)
		);
	}
}
	// ์ธํฌ์๋์ฐ๋ฅผ ํ์ํ๋ ํด๋ก์ ๋ฅผ ๋ง๋๋ ํจ์์๋๋ค
	// 1. ํด๋ฆญ์ ๋ค๋ฅธ ์ธํฌ์๋์ฐ ๋ซ๊ธฐ
	// 2. ํด๋ฆญํ ๊ณณ์ผ๋ก ์ง๋ ์ค์ฌ ์ฎ๊ธฐ๊ธฐ
	function makeOverListener(map, marker, infowindow, coords) {
		return function () {
			// 1. ํด๋ฆญ์ ๋ค๋ฅธ ์ธํฌ์๋์ฐ ๋ซ๊ธฐ
			closeInfowindow();
			infowindow.open(map, marker);

			// 2. ํด๋ฆญํ ๊ณณ์ผ๋ก ์ง๋ ์ค์ฌ ์ฎ๊ธฐ๊ธฐ
			map.panTo(coords);
		};
	}

	// let infowindowArray = [];
	function closeInfowindow() {
		for (let infowindow of infowindowArray) {
			infowindow.close();
		}
	}

	// ์ธํฌ์๋์ฐ๋ฅผ ๋ซ๋ ํด๋ก์ ๋ฅผ ๋ง๋๋ ํจ์์๋๋ค
	function makeOutListener(infowindow) {
		return function () {
		infowindow.close();
		};
	}


/*
**********************************************
5. ์นดํ๊ณ ๋ฆฌ ๋ถ๋ฅ
*/

// ์นดํ๊ณ ๋ฆฌ
const categoryMap = {
	korea: "ํ์",
	china: "์ค์",
	japan: "์ผ์",
	america: "์์",
	wheat: "๋ถ์",
	meat: "๊ตฌ์ด",
	sushi: "ํ/์ด๋ฐฅ",
	etc: "๊ธฐํ",
};

const categoryList = document.querySelector(".category-list");
categoryList.addEventListener("click", categoryHandler);

async function categoryHandler(event) {
	const categoryId = event.target.id;
	const category = categoryMap[categoryId];

	try {
		//๋ฐ์ดํฐ ๋ถ๋ฅ
		let categorizedDataSet = await getDataSet(category);

		//๊ธฐ์กด ๋ง์ปค ์ญ์ 
		closeMarker();

		//๊ธฐ์กด ์ธํฌ์๋์ฐ ๋ซ๊ธฐ
		closeInfowindow();

		setMap(categorizedDataSet);
  	} catch (error) {
		console.error(error);
	}
}

let markerArray = [];
function closeMarker() {
	for (marker of markerArray) {
		marker.setMap(null);
	}
}
async function setting() {
	try {
		const dataSet  = await getDataSet();
		setMap(dataSet);
	} catch (error) {
		console.error(error);
	}
}

setting();