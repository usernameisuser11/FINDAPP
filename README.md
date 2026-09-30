# FINDAPP

필요한 앱과 웹사이트를 검색해서 바로 찾는 대학생용 도구 탐색 허브입니다.

## 주요 기능

- 이름 / 설명 / 태그 통합 검색
- 공부 / AI / 디자인 / 개발 / 문서 / 취업 / 대학생활 / 기타 카테고리
- 무료 사용 가능 / 가입 없이 / 한국어 / AI 필터
- 즐겨찾기
- 최근 본 도구
- 오늘의 추천 + 랜덤 추천
- 모바일 반응형 UI
- 브라우저 localStorage에 개인 즐겨찾기와 최근 기록 저장

## 로컬 실행

```bash
npm install
npm run dev
```

프로덕션 빌드:

```bash
npm run build
npm run preview
```

## Render 배포

이 저장소에는 `render.yaml`이 포함되어 있습니다.

Render에서 직접 설정할 경우:

- Service type: **Static Site**
- Branch: `main`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

GitHub 저장소와 연결하면 `main` 브랜치의 변경 사항을 자동 배포할 수 있습니다.

## 도구 데이터 추가

`src/data/tools.js`의 `tools` 배열에 아래 형식으로 항목을 추가하면 됩니다.

```js
{
  id: 'service-id',
  name: '서비스 이름',
  category: '공부',
  description: '한 줄 설명',
  url: 'https://example.com/',
  tags: ['태그1', '태그2'],
  cost: '무료 사용 가능',
  noSignup: true,
  korean: true,
  ai: false,
}
```

> 요금제, 로그인 조건, 기능은 각 서비스 정책에 따라 바뀔 수 있으므로 실제 사용 시 공식 사이트의 최신 안내를 확인하세요.
