BLIND_BOARD
Raspberry Pi 4 환경에서 프레임워크에 의존하지 않고 순수 기술 스택으로 구축한 경량화된 실시간 게임 매칭 및 로비 서버 시스템임. 제한된 리소스 환경에서도 다중 클라이언트의 세션을 안정적으로 관리함

Tech Stack
Infrastructure: Raspberry Pi (Linux)
Backend: Node.js, Express, Socket.io
Database: MySQL
Frontend: Vanilla JavaScript, HTML5, CSS3

Key Features
RESTful API 매칭 로직: fetch API를 활용하여 비동기 방 생성 및 참가 기능 구현
보안 강화 쿼리: mysql2의 자리표시자를 적용하여 SQL Injection 방어
실시간 대기실 동기화: Socket.io를 활용하여 유저 참가 및 이탈 시 화면 즉각 최신화
데이터베이스 최적화: 방 정보와 플레이어 테이블을 분리하고 비어있는 방 자동 삭제 트리거 구현

트러블슈팅 및 문제 해결
유령 유저 버그 해결: 비동기 통신 간 로컬 스토리지 키 값 네이밍 불일치 문제를 디버깅하여 정상적인 퇴장 및 DB 삭제 로직 복구
서버 오작동 방지: 에디터의 자동 생성 모듈(Auto-import)로 인한 불필요한 패키지 의존성을 파악하고 제거하여 서버 구동 최적화

실행 방법
.env 파일에 MySQL 데이터베이스 연결 정보 입력
npm install 명령어로 필수 모듈 설치
DB/schema.sql을 실행하여 데이터베이스 테이블 및 구조 세팅
node server.js 명령어로 서버 구동 후 접속 테스트
