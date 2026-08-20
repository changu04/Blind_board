const host_name = document.getElementById(`host`);
const player2 = document.getElementById(`player2`);
const player3 = document.getElementById(`player3`);
const player4 = document.getElementById(`player4`);

let player_name = [host_name, player2, player3, player4];

const host_status = document.getElementById(`host_status`);
const player2_status = document.getElementById(`player2_status`);
const player3_status = document.getElementById(`player3_status`);
const player4_status = document.getElementById(`player4_status`);

let player_status = [host_status, player2_status, player3_status, player4_status];

// 보통 url을 string 형식으로 가져오는데
// 이때 id가 필요하면 보통은 ?부터 몇바이트 뒤까지를 가져온다 이런 식인데
// URLSearchParams() 는 url을 멤버단위로 쪼개서 객체로 반환함
// 그러면 우리는 반환받은 객체에서 id라는 멤버를 찾아서 가져오면 되는거임
const urlParms = new URLSearchParams(window.location.search);
const room_id = urlParms.get(`id`);

const socket = io();

socket.emit('joinRoom', room_id);

console.log(`Here is Room`, room_id);

if (!room_id) {
    alert(`Wrong Access`);
    window.location.href = `../room/room.html`;
}

async function loadRoomInfo (host_name, host_status, player_status, player_name) {
    try {
        console.log(`try refering Room Info`);
        const response = await fetch(`/api/rooms/${room_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        window.data = data;

        console.log(`SERVER Response: `, data);

        if (data.success) {
            console.log(`Refering Success`);
            
            // 초기화
            for (let init_count = 0; init_count < 3; init_count++) {
                player_name[init_count + 1].innerText = "";
                player_status[init_count + 1].innerText = "";
            }
            host_name.innerText = "";
            host_status.innerText = "";


            // 텍스트 입히기
            for (let count = 0; count < data.players.length; count++) {
                if (data.players[count].is_host === 1) {
                    host_name.innerText = data.players[0].nickname;
                    host_status.innerText = data.players[0].status;
                }
                else {
                    player_name[count].innerText = data.players[count].nickname;
                    player_status[count].innerText = data.players[count].status;
                }
            }
        }
        else {
            console.error(`(DEV)Refering FAIL`, data.message);
        }

    } catch (error) {
        console.error(`(DEV)Server Connection Fail`, error);
    }
}

loadRoomInfo(host_name, host_status, player_status, player_name);

socket.on('updateRoom', () => {
    console.log('최신화 실시');
    loadRoomInfo(host_name, host_status, player_status, player_name);
})

window.addEventListener(`beforeunload`, (event) => {
    const player_token = localStorage.getItem(`player_token_${room_id}`);
    if (!player_token) return;

    const Payload = JSON.stringify({
        room_id: room_id,
        player_token: player_token
    })
    const blob = new Blob([Payload], { type: 'application/json' });
    navigator.sendBeacon(`/api/rooms/leave`, blob);
})