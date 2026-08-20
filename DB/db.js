const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({

    // 각종 로그인 정보를 .env 파일에서 안전하게 불러옴
    // .env는 숨겨야하는 정보들 위주로 구성함
    // 도메인
    host: process.env.DB_HOST,
    // 포트
    port: process.env.DB_PORT,
    // 로그인 아이디
    user: process.env.DB_USER,
    // DB 이름 비번
    password: process.env.DB_PASSWORD,
    // DB 이름
    database: process.env.DB_NAME,
    
    // JS랑 MySQL연결 개수 지정
    connectionLimit: 10,
    
    // 만약 connectionLimit 최대치 달성 시 queue에 대기
    waitForConnections: true,
    
    // 만약 connectionLimit 최대치 달성 시 queue에 대기
    // 이떄 queue에 제한을 두지 않음
    queueLimit: 0
});


// 외부 js 파일에서도 require()로 요청하면 pool 객체로 반환하겠다 선언
module.exports = pool;