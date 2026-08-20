const PORT = 3000;
const http = require('http');
const { Server } = require('socket.io');


// db 연결
const db = require("./DB/db.js");
// express 모듈 받기
const express = require("express");
// express 모듈이 req랑 res 객체를 생성해줌
// app.get 함수에서 사용할 예정


// 랜덤 문자열 생성 + 토큰 생성 모듈
const crypto = require("crypto");

const app = express();
app.use(express.json());
// 이제 실제로 우리가 만든 웹페이지를 접속하려는 유저에게 보낼 수 있는 명령어임
// server.js가 존재하는 파일에 public 폴더를 만들고 거기에 프론트엔드 파일을 넣으면 됨
app.use(express.static(`public`));

// socket.io
const server = http.createServer(app);
const io = new Server(server);

// 방 생성 과정
// 여기서 /api/rooms 는 서버 내부의 파일구조를 말하는게 아님
// Express 모듈이 가상으로 생성하는 파일 구조임 (결론: 우리 알빠노? 시전하면 됨.)
// 서버에 요청을 하게 되는데 이걸 HTTP 메시지라고 함
// HTTP 메시지에는 HTTP 요청과 HTTP 응답이 있음
// HTTP 응답은 서버에서 웹브라우저로
// HTTP 요청은 웹브라우저에서 서버로 보내는 걸 말함
// 이때 HTTP 요청에는 Get방식과 Post 방식이 있음
// Get은 서버에 요청해서 데이터를 받아올 때 사용함 ( 사용자의 URL 뒤로 데이터가 붙음 )
// Post는 서버에 데이터 생성/수정을 요청할 때 사용함 ( body 부분에 데이터를 첨부 가능함 )
app.post('/api/rooms', async (req, res) => {
    try {
        // 사용자에게 room 이름 받기
        // req가 HTTP 통신으로 들어온 패킷? 같은거임
        const { room_name, nickname } = req.body;
        if (!room_name || !nickname) {
            console.log(`room_name: ${room_name}, nickname: ${nickname}`);
            return res.status(400).json({
                success: false,
                message: "No Room Name or Nickname"
            })
        }
        console.log("Create Room: ", room_name);

        let room_code = '';
        let isMatch = false;

        while (!isMatch) {
            // ramdomBytes(3) => 3바이트 크기 랜덤 데이터 받기
            // toString('hex') => 뽑은 3바이트 랜덤 데이터를 16진수로 변환 (그러면 6글자가 됨)
            // toUpperCase() => 소문자는 대문자로 변환
            room_code = crypto.randomBytes(3).toString('hex').toUpperCase();

            // 쿼리문임 (아래 쿼리문 설명)
            // 쿼리문이란 SQL/DB를 조작하는 전용 명령어 정도 생각하면 됨
            // 지금 단계는 아직 실행 안됨 (그냥 문자열 형태로 저장됨)
            const checkQuery = `SELECT COUNT (*) as count FROM rooms WHERE room_code = ?`;
            // SELECT 는 SQL 명령어 -> 데이터 조회
            // SELECT 를 사용하면 무조건 2칸짜리 배열로 반환함 그중에 0번째 배열에 우리가 조회한 데이터들이 있음
            // COUNT 는 모든 줄의 개수를 세는 함수 -> (*)는 리눅스에서 배운 와일드카드 생각하면 됨 (모든 데이터)
            // as count 는 count 변수에 저장 (checkResult 객체 배열에 저장됨)
            // FROM rooms 는 SQL 스키마에서 생성된 DB 내부의 표 이름임 -> 이걸 조회하겠다는 소리
            // WHERE 은 조건문임. 위에 내용을 보면 SQL 스키마 DB의 rooms이란 표에서 room_code랑 ? 를 비교하는 논리연산자를 쓰겠다는거임 (밑에 ? 설명함)
            // room_code = ? 는 나중에 실행할 때 ? 자리에 매개변수가 삽입됨 (이걸 자리표시자라고 부름)
            // 이해하기 쉽게 설명하면 
            // C언어에서 printf("%d", Arg); 이거 생각하면 됨
            // 왜 이렇게 쓰냐? SQL인젝션 이라는 유명한 해킹 기법이 있는데 자리표시자를 사용하면 그걸 방어할 수 있음

            // db.query()로 이제 checkQuery를 실행할 차례
            // db.query(쿼리문, 자리표시자 배열) 로 이루어짐
            const [checkResult] = await db.query(checkQuery, [room_code]);
            // [checkResult]로 표시된 이유는 
            // js에서 지원하는 배열구조분해할당 이란 기능임
            // db.query()는 2칸짜리 배열로 반환되는데 이때 0번 배열이 우리가 필요한 값임 
            // 그래서 [checkResult, 1번 배열값]으로 선언되는걸 [checkResult]로 줄임
            // 위에서 정의한 db는 db.js에서 선언된 pool 객체를 말함
            // db.js pool 객체를 보면 query라는 멤버함수는 없지만 db.js에서 mysql 라이브러리를 불러와서 이미 정의되어 있음
            // 그리고 위의 쿼리문에서 나온 ?(자리표시자)를 위해서 매개변수를 db.query함수의 두번째 매개변수에 넣어야하는데 이건 무조건 배열로 들어가야함
            // 그래서 [? 첫번째, ? 두번째, ? 세번째... ] 이런식인데 우리는 ? 하나만 쓰기 때문에 [roomdCode]인거임

            if (checkResult[0].count === 0) {
                // 위에서 SELECT 는 배열로 반환하는데 0번째 배열에 데이터가 있다고 했음
                // 그래서 SELECT 쿼리문의 반환을 받은 checkResult가 [0]만 쓰는 이유임
                isMatch = true;
            }
            else {
                console.log(`코드 중복, 재시도: ${room_code}`);
            }
        }
        console.log(`방 코드 생성 완료: ${room_code}`);
        // 이제 생성한 room_code를 DB에 삽입할 차례
        // 삽입을 위한 쿼리문 작성
        const insertRoomQuery = `INSERT INTO rooms (room_code, room_name, max_players, status) VALUES(?, ?, ?, 'WAITING')`;
        // INSERT INTO rooms 는 rooms라는 표에 삽입을 하겠다는 뜻임
        // (room_code, room_name, max_players, status) 는 rooms 표 안에 있는 해당 값에 순서대로 넣겠다는 뜻임
        // VALUES(?, ?, ?, 'WAITING') 는 앞에서 room_code랑 room_name 등등에 넣겠다고 선언한 것에 따라 넣겠다는 뜻임
        // ? 는 위에서 쿼리문 설명할 때랑 똑같이 자리표시자임

        const [roomResult] = await db.query(insertRoomQuery, [room_code, room_name, 4]);

        // 자동 생성된 ID 가져오기
        const room_id = roomResult.insertId;
        const player_token = crypto.randomUUID();

        const insertPlayerQuery = `
        INSERT INTO room_players (room_id, player_token, nickname, player_order, is_host, status)
        VALUES (?, ?, ?, 1, true, 'JOINED')`;

        await db.query(insertPlayerQuery,[room_id, player_token, nickname]);

        // res는 위에서 app.get함수에서 req랑 매개변수로 나온 객체임 (express 모듈이 자동생성해줌)
        res.status(201).json({
            success: true,
            message: "Create rooms success",
            room_id: room_id,
            room_code: room_code,
            player_token: player_token
        })
        // 201 번 코드 = HTTP 상태 코드 중 성공적으로 잘 생성됨을 의미함
        // 예를 들면 404 뭐 이런거
        // json 형태로 생성해서 웹브라우저로 전송함
        // result.insertId 는 스키마 SQL에서
        // room_id BIGINT AUTO_INCREMENT PRIMARY KEY 라고 선언했음
        // 이때 AUTO_INCREMENT 라고 했는데 이건 SQL이 생성하고 알아서 ID를 생성해서 붙인다는 뜻임
        // 그게 result.insertId에 있는거임
    }
    catch (error) {
        console.error("(Dev)방 코드 생성 및 입장 에러: ", error);
        res.status(500).json({ success: false, message: "방 생성 중 서버 오류 발생" });
    }
});

// 방 가입 과정
app.post(`/api/rooms/join`, async (req, res) => {
    try {
        // 이건 객체구조할당임 
        // const room_id = req.body.room_id; 와 똑같은 코드임
        // 쉽게 말하면 객체 멤버랑 똑같은 이름으로 다른 변수로 분리하고 싶으면 쓰는 문법임
        const { room_id, nickname } = req.body;
        console.log(`[입장 시도] 방 번호: ${room_id}, 닉네임: ${nickname}`);

        // 토큰 발급
        const player_token = crypto.randomUUID();
        // 참여하려는 방에 정원이 다 찼는지 확인하는 쿼리문
        // SELECT 는 SQL 명령어 -> 데이터 조회
        // WHERE 은 조건문임. 해당 방 번호(room_id)의 정보만 가져오겠다는 뜻임
        const checkQuery = `SELECT COUNT(*) as playerCount FROM room_players WHERE room_id = ? AND status = 'JOINED'`;
        const [countResult] = await db.query(checkQuery, [room_id]);
        const playerCount = countResult[0].playerCount;
        
        if (playerCount >= 4) {
            // 정원 초과
            return res.status(400).json({ success: false, message: "Room FULL"});
        }
        else if (countResult.length === 0) {
            // 만약 존재하지 않는 방이라면 쿼리문은 배열 길이를 0으로 반환할 거임
            return res.status(404).json({ success: false, message: 'Does not exist room' });
        }

        // 만약 playerCount가 0 이라면 참 = (playerCount === 0)
        const is_host = (playerCount === 0);
        const player_order = playerCount + 1;

        // DB정보 삽입 쿼리
        const insertQuery = `
            INSERT INTO room_players (room_id, player_token, nickname, player_order, is_host, status)
            VALUES (?, ?, ?, ?, ?, 'JOINED')`;

        await db.query(insertQuery, [room_id, player_token, nickname, player_order, is_host]);

        // res는 express 모듈이 자동생성해준 응답 객체임
        res.status(200).json({
            success: true,
            message: "Joining Room SUCCESS",
            room_id: room_id,
            player_token: player_token
        });
        // 200 번 코드 = HTTP 상태 코드 중 성공적으로 잘 통신됨을 의미함
        // json 형태로 생성해서 웹브라우저로 전송함

    }
    catch (error) {
        console.error(`(Dev)방 참가 중 에러 발생: `, error);
        res.status(500).json({ success: false, message: "방 참가 중 서버 오류 발생" });
    }
});

// 특정 방 조회 과정
app.get(`/api/rooms/:room_id`, async (req, res) => {
    try {
        // 이건 객체구조할당임 
        // const room_code = req.params.room_code;
        // 이거랑 똑같은 코드임
        // 쉽게 말하면 객체 멤버랑 똑같은 이름으로 다른 변수로 분리하고 싶으면 쓰는 문법임
        
        const { room_id } = req.params;
        console.log(`Try Refering Room No.${room_id}`);
        const roomQuery = `SELECT * FROM rooms WHERE room_id = ?`;
        
        const [rooms] = await db.query(roomQuery, [room_id]);

        // 만약 존재하지 않는 방이라면 쿼리문은 방 이름의 크기를 0으로 반환 할거임
        if (rooms.length === 0) {
            return res.status(404).json({success: false, message: `Does not exist room`});
        }
        const room = rooms[0];

        const playerQuery = `
            SELECT player_id, nickname, player_order, is_host, status, player_token
            FROM room_players
            WHERE room_id = ? AND status = 'JOINED'
            ORDER BY player_order ASC`

        // ORDER BY 명령어는 정렬 명령어임
        // player_order 를 기준으로
        // ASC (Ascending) = 오름차순 으로 정렬 (반대는 DESC, Descending)
        // 작은거부터 ~ 큰걸로
        
        const [players] = await db.query(playerQuery, [room.room_id]);

        res.status(200).json({
            success: true,
            room: {
                room_id: room.room_id,
                room_code: room.room_code,
                room_name: room.room_name,
                status: room.status
            },
            players: players
        });
        console.log(`SUCCESS Refering Room No.${room_id}`);        
    }
    catch (error)   {
        console.error("(DEV)ERROR: Searching Room info", error);
        res.status(500).json({ success: false, message: "Server error"});
    }
});

// 전체 방 조회 과정 (join.html 접속하면 방 리스트를 출력해줄거임)
app.get(`/api/rooms`, async (req, res) => {
    try {
        // 방 정보 조회
        // ++ 각 방의 정원 조회
        const query = `
            SELECT 
                r.room_id, 
                r.room_code, 
                r.room_name,
                r.max_players, 
                r.status,
                (SELECT COUNT(*) FROM room_players rp WHERE rp.room_id = r.room_id AND rp.status = 'JOINED') AS player_count
            FROM rooms r
            ORDER BY room_id DESC
            `;
        const [roomList] = await db.query(query);

        return res.status(200).json({
            success: true,
            rooms: roomList
        });

    } catch (error) {
        console.error("(DEV)ERROR: Fail to Get Room List: ", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
})

// 플레이어 퇴장 + 방 삭제 과정
app.post(`/api/rooms/leave`, async (req, res) => {
    const { room_id, player_token } = req.body;
    // 이탈한 플레이어 삭제
    const deletePlayerQuery = `DELETE FROM room_players WHERE player_token = ? AND room_id = ?`;
    await db.query(deletePlayerQuery, [player_token, room_id]);
    
    // 이탈 이벤트 발생 시 (지금 상황) 방에 구성인원이 0명인 방을 찾음
    const EmptyRoomQuery = `SELECT COUNT(*) as playerCount FROM room_players WHERE room_id = ? AND status = 'JOINED'`;
    const [countPlayer_result] = await db.query(EmptyRoomQuery, [room_id]);
    const countPlayer = countPlayer_result[0].playerCount;
    // 있다면 삭제
    if (countPlayer === 0) {
        const deleteRoomQuery = `DELETE FROM rooms WHERE room_id = ?`;
        await db.query(deleteRoomQuery, [room_id]);
    }
    else    {
        io.to(String(room_id)).emit('updateRoom');
    }

    return res.status(200).json({ success: true, message: 'Success Ending' });
})

// socket.io 통신
io.on('connection', (socket) => {
    socket.on('joinRoom', (room_id) => {
        socket.join(String(room_id));
        console.log(`(SOCKET) ${socket.id} join ${room_id}.`);

        socket.to(String(room_id)).emit('updateRoom');
    })

    socket.on('disconnect', () => {
        console.log(`(SOCKET)disconnect`);
    })
    
})



// 맨 첫줄 PORT라는 변수 (=7979)
// 7979번 포트에서 웹브라우저에서 날라온 통신 대기하겠단 의미
server.listen(PORT, () => {
    console.log(`NOW Server Is LIVE`);
}) 
