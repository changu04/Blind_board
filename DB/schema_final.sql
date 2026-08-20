-- =========================================================
-- MySQL 8 기준
-- =========================================================

-- 기존에 있던 game_db 삭제 후 새로 생성
DROP DATABASE IF EXISTS game_db;

-- 새롭게 game_db 생성
CREATE DATABASE game_db
-- 최신 표준 문자 규칙 적용 (한글, 이모지 지원)
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

-- game_db 사용 선언
USE game_db;

-- =========================================================
-- 1. 방 테이블 (초경량 단일 테이블)
-- 방 만들기, 빠른 매칭, 방 이름 검색에 사용
-- =========================================================
CREATE TABLE rooms (
    room_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- 사용자가 방 참여할 때 입력할 수 있는 방 코드
    room_code VARCHAR(12) NOT NULL UNIQUE,

    -- 방 이름 검색용
    room_name VARCHAR(100) NOT NULL,

    -- 이 게임은 기본 4인 게임
    max_players INT NOT NULL DEFAULT 4,

    -- 방 상태 (간소화 완료)
    status ENUM('WAITING', 'FULL', 'PLAYING', 'FINISHED')
        NOT NULL DEFAULT 'WAITING',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE room_players (
    player_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    player_token VARCHAR(255) NOT NULL, -- 유저 고유 신분증
    room_id BIGINT NOT NULL,          -- 어느 방에 들어갔는지
    nickname VARCHAR(50) NOT NULL,    -- 프론트에서 받은 닉네임
    player_order INT NOT NULL,        -- 몇 번째로 들어왔는지 (1번이 방장)
    is_host BOOLEAN NOT NULL DEFAULT FALSE, -- 방장 여부
    status ENUM('JOINED', 'READY', 'DISCONNECTED') NOT NULL DEFAULT 'JOINED',
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 방이 삭제되면 이 방에 있던 유저 정보도 같이 삭제됨
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);