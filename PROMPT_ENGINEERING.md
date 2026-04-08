# SQL Injection 실습 웹사이트 - 프롬프트 엔지니어링 문서

## 1. 프로젝트 개요

### 목적
SQL Injection의 원리를 이해하고 직접 실습할 수 있는 교육용 웹 사이트 제작

### 대상
- 정보보안 입문자
- 웹 개발자 (보안 인식 향상)
- ICT 교육 수강생

### 배포 환경
- GitHub Pages (정적 호스팅)
- 클라이언트 사이드 SQLite (sql.js / WebAssembly)

---

## 2. 프롬프트 설계

### 시스템 프롬프트 (AI 교육 보조)

```
당신은 SQL Injection 보안 교육 전문가입니다.
학습자가 SQL Injection의 원리를 이해하고 방어 방법을 습득할 수 있도록 돕습니다.

역할:
- SQL Injection의 유형별 원리를 단계적으로 설명
- 실습 환경에서 안전하게 공격 기법을 체험하도록 안내
- 각 실습 후 방어 코드(Parameterized Query 등)를 제시
- 절대 실제 시스템 공격을 유도하지 않음

교육 단계:
1단계: SQL 기본 문법 복습
2단계: SQL Injection 원리 이해 (문자열 조합의 위험성)
3단계: 기본 인증 우회 실습
4단계: UNION 기반 데이터 추출 실습
5단계: Blind SQL Injection 개념
6단계: 방어 기법 학습 및 적용
```

### 실습 시나리오별 프롬프트

#### 시나리오 1: 로그인 우회 (Authentication Bypass)

```
[상황] 로그인 폼이 있습니다. 내부적으로 다음 SQL이 실행됩니다:
SELECT * FROM users WHERE username = '{입력값}' AND password = '{입력값}'

[목표] 비밀번호를 모르는 상태에서 admin 계정으로 로그인하세요.

[힌트 1단계] SQL에서 -- 는 주석을 의미합니다.
[힌트 2단계] username에 admin'-- 를 입력하면 어떻게 될까요?
[힌트 3단계] 완성되는 SQL: SELECT * FROM users WHERE username = 'admin'--' AND password = ''
```

#### 시나리오 2: UNION 기반 데이터 추출

```
[상황] 상품 검색 기능이 있습니다. 내부 SQL:
SELECT name, price FROM products WHERE name LIKE '%{입력값}%'

[목표] users 테이블의 모든 사용자 정보를 추출하세요.

[힌트 1단계] UNION SELECT를 사용하면 다른 테이블의 데이터를 합칠 수 있습니다.
[힌트 2단계] 컬럼 수를 맞춰야 합니다. 원래 쿼리는 2개 컬럼을 반환합니다.
[힌트 3단계] ' UNION SELECT username, password FROM users --
```

#### 시나리오 3: 테이블 구조 파악

```
[상황] 검색 기능을 통해 데이터베이스 구조를 파악해야 합니다.

[목표] 어떤 테이블들이 존재하는지 알아내세요.

[힌트] SQLite에서는 sqlite_master 테이블에 스키마 정보가 있습니다.
' UNION SELECT name, sql FROM sqlite_master --
```

---

## 3. 학습 흐름 설계

```
[도입] SQL이란?
  ↓
[이해] 동적 쿼리의 위험성
  ↓
[실습 1] 로그인 우회 → 성공 시 축하 + 원리 설명
  ↓
[실습 2] UNION Injection → 데이터 추출 체험
  ↓
[실습 3] DB 구조 탐색 → 메타데이터 접근
  ↓
[방어] Parameterized Query 비교 실습
  ↓
[정리] 체크리스트 + 퀴즈
```

---

## 4. 기술 구현 프롬프트

```
GitHub Pages에 배포 가능한 SQL Injection 교육용 웹사이트를 만들어주세요.

기술 요구사항:
- 순수 HTML/CSS/JavaScript (프레임워크 없음)
- sql.js (WebAssembly 기반 클라이언트 SQLite)
- 반응형 디자인
- 한국어 UI

기능 요구사항:
1. 메인 페이지: 개념 설명 + 실습 목록
2. 실습 1 - 로그인 우회: 로그인 폼, 실행되는 SQL 실시간 표시
3. 실습 2 - UNION Injection: 검색 폼, 결과 테이블 표시
4. 실습 3 - DB 구조 탐색: 메타데이터 추출 실습
5. 방어 실습: 취약 코드 vs 안전 코드 비교
6. 각 실습에 단계별 힌트 시스템
7. 진행률 표시

보안 고려사항:
- 모든 처리는 클라이언트에서 수행 (서버 없음)
- 교육 목적 명시 (면책 경고문)
- 실제 시스템 공격 금지 안내
```

---

## 5. 평가 기준

| 항목 | 기준 |
|------|------|
| 이해도 | SQL Injection 원리를 설명할 수 있는가 |
| 실습 완료 | 3개 시나리오를 모두 성공했는가 |
| 방어 능력 | Parameterized Query를 작성할 수 있는가 |
| 윤리 의식 | 허가 없는 시스템 테스트 금지를 이해하는가 |
