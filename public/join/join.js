// 방 조회해서 웹페이지에 뿌리는 기능
fetch(`/api/rooms`)
    // .then() 메소드는 서버로 부터 응답이 오는게 성공했다면 실행시킨다 뭐 이런 함수임
    // 밑에 계속 .then()이 붙는건 객체에서 배운 체이닝으로 생각하면됨
        // 성공하면 그 다음 .then() 또 성공하면 그 다음 .then
    
    // response 는 서버에 요청하고 나서 리턴받는 객체 라고 생각하면됨
    // response 객체에는 .json 이라는 객체멤버함수(=메소드)가 있는데 이건 .json 파일을 
    // 우리가 가공하기 쉽게 객체나 배열의 형태로 변환해줌. 그래서 우린 그걸로 데이터를 가공할 수 있게 되는거임
    // => 이건 화살표함수라고 부름 쉽게 말하면 return 한줄만 적은 함수라고 생각하면 되는데 
    // 지금 상황에서는 response.json()을 return 한다는 내용임
    // 그러면 그 return 한 데이터는 누가 받냐?
    // 체이닝한 그 다음 .then()에서 매개변수가 받음 이때 매개변수를 뭐 새로 선언하는게 아니라
    // 그냥 새로운 변수 아무거나 쓰면 그게 매개변수임 (지금 상황에서는 data임)
    .then(response => response.json())
    .then(data =>{
        console.log("DATA FROM SERVER: ", data);
        

        if (data.success) {
            const container = document.getElementById('room-list-container');
            if (!container) {
                console.error("(DEV)room-list-container does not exist", error);
            }
            container.innerHTML = ``; // room-container 초기화
            

            if (data.rooms.length === 0) {
                container.innerHTML = `<p> 현재 방이 없습니다 </p>`
                return;
            }
            
            if (data.rooms.length > 0) {
                for (let room = 0; room < data.rooms.length; room++) {
                    const room_container = document.createElement('div');
                    room_container.className = 'room-item';
                    room_container.innerHTML = `
                        <div>${data.rooms[room].room_name} | ${data.rooms[room].status} | (${data.rooms[room].player_count}/${data.rooms[room].max_players})</div>
                    `;
                    // 방 클릭하면 방으로 가입하는 기능
                    room_container.addEventListener(`click`, async () => {
                        // 닉네임 입력
                        const nickname = prompt("Enter NickName");
                        // 닉네임 공백으로 제출 시
                        if (!nickname || nickname.trim() === "") {
                            alert("Need NickName");
                            return;
                        }

                        // 클릭한 방 id 가져오기
                        const Clicked_room_id = data.rooms[room].room_id;
                        fetch(`/api/rooms/join`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                room_id: Clicked_room_id,
                                nickname: nickname
                            })
                        })
                            .then(response => response.json())
                            .then(joinData => {
                                if (joinData.success) {
                                    localStorage.setItem(`player_token_${joinData.room_id}`, joinData.player_token);
                                    window.location.href = `../game/game.html?id=${joinData.room_id}`;
                                    }
                                else    {
                                    alert(`Join Fail`, + joinData.message);
                                    location.reload();
                                    }
                                })
                            .catch(error => console.error(`(DEV)Join Fail:` + joinData.message));
                    });
                    container.appendChild(room_container);
                }
            }
        }
    })
    .catch(error => console.error("(Dev)Fail to get Room List: ", error));


