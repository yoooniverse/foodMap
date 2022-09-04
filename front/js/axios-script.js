/*
💡 1.   지도 생성 & 확대 축소 컨트롤러

1. 더미데이터 준비하기 (제목, 주소, url, 카테고리)
2. 여러개 마커 찍기
    - 주소 - 좌표 변환
3. 마커에 인포윈도우 붙이기
    - 마커에 클릭 이벤트로 인포윈도우
    - url에서 섬네일 따기
    - 클릭한 마커로 지도 센터 이동
4. 카테고리 분류
*/


var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.54, 126.96), // 지도의 중심좌표
        level: 8 // 지도의 확대 레벨
    };

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

// // 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
// var mapTypeControl = new kakao.maps.MapTypeControl();

// // 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// // kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
// map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);




/*더미데이터*/
async function getDataSet(category) {
	let qs = category;
	if (!qs) {
		qs = "";
	}

	const dataSet = await axios({
		method: "get",
		url: `http://localhost:3000/restaurants?category=${qs}`,
		header: {},
		data: {},
	});
	return dataSet.data.result;
}

getDataSet();


/*
**********************************************************
3. 여러개 마커 찍기
  * 주소 - 좌표 변환
https://apis.map.kakao.com/web/sample/multipleMarkerImage/ (여러개 마커)
https://apis.map.kakao.com/web/sample/addr2coord/ (주소로 장소 표시하기)
*/

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();


/*주소좌표 변환 함수*/
function getCoordsByAddress(address) {
	return new Promise((resolve, reject) => {
		// 주소로 좌표를 검색합니다
		geocoder.addressSearch(address, function(result, status) {
			// 정상적으로 검색이 완료됐으면
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
4. 마커에 인포윈도우 붙이기
  * 마커에 클릭 이벤트로 인포윈도우 https://apis.map.kakao.com/web/sample/multipleMarkerEvent/
  * url에서 섬네일 따기
  * 클릭한 마커로 지도 센터 이동 https://apis.map.kakao.com/web/sample/moveMap/
*/

function getContent(data) {
	//유튜브 썸네일 id 가져오기
	let replaceUrl = data.videoUrl;
	let finUrl = "";
	replaceUrl = replaceUrl.replace("https://youtu.be/", "");
	replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", "");
	replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", "");
	finUrl = replaceUrl.split("&")[0];

	replaceUrl = replaceUrl.replace("")
	//인포윈도우 가공하기
	return `
	<div class="infowindow">
        <div class="infowindow-img-container">
            <img src="https://img.youtube.com/vi/${finUrl}/mqdefault.jpg"
                class="infowindow-img">
        </div>
        <div class="infowindow-body">
            <h5 class="infowindow-title">${data.title}</h5>
            <p class="infowindow-address">${data.address}</p>
            <a href="${data.videoUrl}" class="infowindow-btn" target="_blank">영상이동</a>
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
    	// 마커를 생성합니다
    	let coords = await getCoordsByAddress(dataSet[i].address);
    	var marker = new kakao.maps.Marker({
      	map: map, // 마커를 표시할 지도
      	position: coords, // 마커를 표시할 위치
    	});

		markerArray.push(marker);

    	// 마커에 표시할 인포윈도우를 생성합니다
    	var infowindow = new kakao.maps.InfoWindow({
      	content: getContent(dataSet[i]), // 인포윈도우에 표시할 내용
    	});

		infowindowArray.push(infowindow);

		// 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
		// 이벤트 리스너로는 클로저를 만들어 등록합니다
		// for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
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
	// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
	// 1. 클릭시 다른 인포윈도우 닫기
	// 2. 클릭한 곳으로 지도 중심 옮기기
	function makeOverListener(map, marker, infowindow, coords) {
		return function () {
			// 1. 클릭시 다른 인포윈도우 닫기
			closeInfowindow();
			infowindow.open(map, marker);

			// 2. 클릭한 곳으로 지도 중심 옮기기
			map.panTo(coords);
		};
	}

	// let infowindowArray = [];
	function closeInfowindow() {
		for (let infowindow of infowindowArray) {
			infowindow.close();
		}
	}

	// 인포윈도우를 닫는 클로저를 만드는 함수입니다
	function makeOutListener(infowindow) {
		return function () {
		infowindow.close();
		};
	}


/*
**********************************************
5. 카테고리 분류
*/

// 카테고리
const categoryMap = {
	korea: "한식",
	china: "중식",
	japan: "일식",
	america: "양식",
	wheat: "분식",
	meat: "구이",
	sushi: "회/초밥",
	etc: "기타",
};

const categoryList = document.querySelector(".category-list");
categoryList.addEventListener("click", categoryHandler);

async function categoryHandler(event) {
	const categoryId = event.target.id;
	const category = categoryMap[categoryId];

	try {
		//데이터 분류
		let categorizedDataSet = await getDataSet(category);

		//기존 마커 삭제
		closeMarker();

		//기존 인포윈도우 닫기
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