let roomName = document.getElementById("room_name");
let create_button = document.getElementById("create_button");

create_button.addEventListener(`click`, async () => {
    let roomName_value = roomName.value;
    if (!roomName_value.trim()) {
        alert("방 이름을 비워둠");
        roomName.focus();  // 이거 하면 roomName 받는 곳에 커서 이동하게 됨
        return;
    }
    
    console.log("Room Name = ",roomName_value);
    // 서버에 사용자가 작성한 이름 보내서 방 생성하기
    try {
        const nickname = prompt("Enter NickName");
        // Payload 이라는 방식으로 서버랑 통신할거임
        // 서버에 요청을 하게 되는데 이걸 HTTP 메시지라고 함
        // HTTP 메시지에는 HTTP 요청과 HTTP 응답이 있음
        // HTTP 요청은 웹브라우저에서 서버로
        // HTTP 응답은 서버에서 웹브라우저로 보내는 걸 말함
        // 이때 Payload 라는 방식은 HTTP 요청을 보낼 때 header 와 body라는 부분 중 body에 요청사항을 적음
        // 지금 상황을 예로 들면 roomName을 보내게 됨

        // 함수 fetch()를 통해서 서버로 HTTP 요청을 하게 됨
        // 이때 HTTP 요청에는 Get방식과 Post 방식이 있음
        // Get은 서버에 요청해서 데이터를 받아올 때 사용함 ( 사용자의 URL 뒤로 데이터가 붙음 )
        // Post는 서버에 데이터 생성/수정을 요청할 때 사용함 ( body 부분에 데이터를 첨부 가능함)
        const response = await fetch(`/api/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                room_name: roomName_value,
                nickname: nickname
            })
        });
        // HTTP 요청을 하면 HTTP 응답을 받게 되는데 지금 상황에서는 변수 response가 받음
        // .json 형식으로 받음
        const data = await response.json();
        localStorage.setItem(`player_token_${data.room_id}`, data.player_token);
        console.log(`SERVER Response: `, data);

        if (data.success) {
            console.log(data);
            alert(`[${roomName_value}\] 생성됨`);
            roomName.value = ""    // 미리 초기화 시키기
            window.top.location.href = `../game/game.html?id=${data.room_id}`;
        }
        else    {
            alert("Fail: " + data.message);
        }
    } catch (error) {
        console.error("(Dev)Server Connection Fail", error);
    }    
})
