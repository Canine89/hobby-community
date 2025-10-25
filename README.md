# 취미 커뮤니티 게시판

Next.js, Prisma, NextAuth를 사용한 레딧/디시인사이드 스타일의 커뮤니티 게시판 서비스입니다.

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **데이터베이스**: SQLite (개발) / Supabase Postgres (배포)
- **ORM**: Prisma
- **인증**: NextAuth.js v5 (Credentials Provider)
- **UI**: shadcn/ui, Tailwind CSS
- **에디터**: Tiptap (Rich Text Editor)

## 주요 기능

### 사용자 기능
- ✅ 회원가입 / 로그인 / 로그아웃
- ✅ 프로필 관리 (사진, 소개, 사용자명)
- ✅ 내가 작성한 게시글/댓글 목록

### 게시판 기능
- ✅ 여러 보드(게시판) 지원
- ✅ 게시글 작성/수정/삭제 (리치텍스트 에디터)
- ✅ 댓글 작성/수정/삭제
- ✅ 게시글/댓글 좋아요/싫어요
- ✅ 게시글 조회수
- ✅ 페이지네이션
- ✅ 검색 기능 (제목/내용)

### 관리자 기능
- ✅ 사용자 관리 (역할 변경, 삭제)
- ✅ 게시글 관리 (전체 게시글 삭제)
- ✅ 게시판 관리 (생성, 수정, 삭제)
- ✅ 통계 대시보드

## 시작하기

### 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

**중요**: 배포 시 `NEXTAUTH_SECRET`을 안전한 값으로 변경하세요.

### 의존성 설치

```bash
npm install
```

### 데이터베이스 마이그레이션 및 시드

```bash
# 마이그레이션 실행
npx prisma migrate dev

# 시드 데이터 생성 (관리자 계정 및 기본 게시판)
npx prisma db seed
```

### 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 기본 계정 정보

시드 스크립트로 생성된 관리자 계정:

- **이메일**: admin@community.com
- **비밀번호**: admin123!

## 프로젝트 구조

```
/app
  /(main)              # 메인 레이아웃
    /board/[slug]      # 게시판 목록
      /new             # 게시글 작성
    /post/[id]         # 게시글 상세
      /edit            # 게시글 수정
    /profile           # 내 프로필
    /admin             # 관리자 페이지
      /users           # 사용자 관리
      /posts           # 게시글 관리
      /boards          # 게시판 관리
  /auth
    /login             # 로그인
    /signup            # 회원가입
  /api
    /auth              # NextAuth API
    /posts             # 게시글 API
    /comments          # 댓글 API
    /votes             # 투표 API
    /user              # 사용자 API
    /admin             # 관리자 API

/components
  /layout              # 헤더, 사이드바
  /editor              # Tiptap 에디터
  /comments            # 댓글 컴포넌트
  /votes               # 투표 버튼
  /posts               # 게시글 컴포넌트
  /ui                  # shadcn/ui 컴포넌트

/lib
  auth.ts              # NextAuth 설정
  prisma.ts            # Prisma 클라이언트
  utils.ts             # 유틸리티 함수

/prisma
  schema.prisma        # 데이터베이스 스키마
  seed.ts              # 시드 스크립트
```

## 데이터베이스 스키마

- **User**: 사용자 정보 (이메일, 비밀번호, 역할 등)
- **Board**: 게시판 정보
- **Post**: 게시글
- **Comment**: 댓글
- **PostVote**: 게시글 투표
- **CommentVote**: 댓글 투표

## Vercel 배포

### 1. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Database 섹션에서 연결 문자열 확인
3. 환경 변수 설정:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="생성한-강력한-시크릿-키"
```

### 2. Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정 (위의 3개 변수)
3. 배포 후 Prisma 마이그레이션:

```bash
# Vercel에서 실행
npx prisma migrate deploy
npx prisma db seed
```

## 라이선스

MIT

## 개발자

취미 커뮤니티 게시판 서비스
