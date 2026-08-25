# DH 교육용 위키 대문 — 로컬 재구성판

[dh.aks.ac.kr의 "대문" 페이지](https://dh.aks.ac.kr/Edu/wiki/index.php/%EB%8C%80%EB%AC%B8)를 참고해
같은 구조(연도별 수업·세미나·답사 링크 목록)를 정적 웹페이지로 재구성했습니다.
MediaWiki 설치 없이 **순수 HTML/CSS/JS**로만 만들어서 
설치 마법사, DB, `.env`, `LocalSettings.php` 같은  과정이 전혀 없습니다. 

IDE 환경에서 코드를 열어 바로 수정하고, Docker로 실행만 하면 됩니다.

## 폴더 구조

```
dh-wiki-page/
├── site/
│   ├── index.html   # 페이지 뼈대 (헤더 + 타임라인 레일 + 본문 컨테이너)
│   ├── style.css     # 디자인 (연도별 아카이브 타임라인 스타일)
│   ├── data.js       # 연도별 수업/세미나/답사 링크 데이터 — 여기만 고치면 내용이 바뀝니다
│   └── script.js     # data.js를 읽어 화면에 그려주는 렌더링 로직
├── Dockerfile         # nginx로 site/ 폴더를 그대로 서빙
├── docker-compose.yml # localhost:8080 으로 실행
└── README.md
```

## IDE에서 편집하기 (필자는 VSCODE 사용)

```bash
code dh-wiki-page
```

- **내용을 바꾸고 싶다면** → `site/data.js`의 `WIKI_DATA`, `EXTRA_SECTIONS` 배열에서
  `title` / `note` / `url`만 수정하면 됩니다.
   새 연도 블록을 통째로 복사해서 추가해도 됩니다.
- **디자인을 바꾸고 싶다면** → `site/style.css` 상단의 `:root` 안 색상 변수(`--paper`, `--ink`, `--teal` 등)를 조정하면 됩니다.

## Render로 배포하기 (추천 — 완전 무료, 카드 등록/과금 걱정 없음)

이 프로젝트는 순수 정적 파일(HTML/CSS/JS)이라, **Render의 "Static Site"** 로 배포하면
Docker 이미지 빌드도, 서버 요금도 없이 무료로 호스팅됩니다.
(Docker Desktop과 달리 Static Site는 카드 등록이나 자동 결제가 붙지 않는 무료 플랜입니다.)

### 방법 A — render.yaml로 한 번에 배포 (Blueprint)

1. 이 폴더(`dh-wiki-page`)를 GitHub 저장소에 올립니다.
   ```bash
   cd dh-wiki-page
   git init
   git add .
   git commit -m "dh wiki page"
   gh repo create dh-wiki-page --public --source=. --push
   # (gh CLI가 없다면 GitHub 웹에서 새 저장소를 만들고 git remote add / git push 로 올리면 됩니다)
   ```
2. [Render 대시보드](https://dashboard.render.com/) → **New** → **Blueprint** 클릭
3. 방금 만든 GitHub 저장소를 선택합니다.
   저장소 루트의 `render.yaml`을 Render가 자동으로 읽어
   `dh-wiki-page` 라는 이름의 **Static Site** 서비스를 만들어줍니다.
4. **Apply** 클릭 → 1분 내로 `https://dh-wiki-page.onrender.com` 같은 주소가 발급됩니다.

### 방법 B — 대시보드에서 수동으로 (render.yaml 없이도 가능)

1. GitHub에 저장소 올리기 (방법 A의 1번과 동일)
2. Render 대시보드 → **New** → **Static Site**
3. 저장소 연결 후 다음 값만 입력:
   - **Build Command**: (비워둠)
   - **Publish Directory**: `site`
4. **Create Static Site** 클릭 → 배포 완료

이후 `git push` 할 때마다 Render가 자동으로 재배포합니다.

---

## (참고) Docker로 로컬 실행하기 — 선택 사항, 배포에는 필요 없음

Render Static Site로 배포한다면 Docker는 전혀 필요하지 않습니다.
다만 로컬에서 배포 전 미리보기를 하고 싶다면 아래처럼 Docker로도 실행할 수 있습니다
(이 Dockerfile은 Render의 "Docker" 서비스 타입으로 배포하고 싶을 때도 그대로 쓸 수 있도록
`$PORT` 환경변수를 지원하게 만들어 두었습니다).

터미널(Ctrl+`)에서:

```bash
docker compose up -d --build
```

브라우저에서 `http://localhost:8080` 접속하면 바로 페이지가 뜹니다.
빌드 없이 nginx가 정적 파일을 그대로 서빙하기 때문에 데이터베이스도, 계정 가입도,
`.env`도 필요 없습니다.

`data.js`를 수정한 뒤 다시 보려면:

```bash
docker compose restart web
```

종료:

```bash
docker compose down
```

## 참고

이 페이지는 [dh.aks.ac.kr 대문](https://dh.aks.ac.kr/Edu/wiki/index.php/%EB%8C%80%EB%AC%B8)의
구성(연도별 수업/세미나/답사 링크 목록)을 참고해 만든 실습용 재구성본입니다.
링크는 모두 원본 사이트로 연결됩니다.
