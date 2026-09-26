# DH 교육용 위키 대문 — 로컬 재구성판 
## 석사 지원자 iteratorfor42 입시 포트폴리오

[🌐 실제 웹사이트 미리보기(Render 배포 주소)](https://visualhumanities-39wz.onrender.com/)

---

## 화면 소개 및 구성 내용

2014년부터 이어져 온 한국학대학원 인문정보학 수업과 세미나, 학술답사 기록을 연도별로 정리한 목록입니다.  
2014년부터 2025년까지의 목록 링크는 모두 원본 사이트로 연결됩니다.

제 학습용 기록은 아래 링크나 별도 마크다운 파일을 통해 확인하실 수 있습니다:

* 📝 **지원자 학습 내역 보러가기** (https://visualhumanities-39wz.onrender.com/my-studies.html)
* ✍️ **제가 독학한 여름학교 실습 글 보러가기** (https://visualhumanities-39wz.onrender.com/my-posts.html)
* 🕸️ **[온톨로지 프로젝트 보러가기]** (https://visualhumanities-39wz.onrender.com/ontology/versions.html)


[📖 온톨로지 프로젝트 소개 readme.md 보기](./ontology_readme.md)
>(참고> 위 readme는 웹사이트에도 html로 공개했습니다.)

---

# DH 교육용 위키 대문 — 로컬 재구성판 소개 
[dh.aks.ac.kr의 "대문" 페이지](https://dh.aks.ac.kr/Edu/wiki/index.php/%EB%8C%80%EB%AC%B8)를 참고해
같은 구조(연도별 수업·세미나·답사 링크 목록)를 정적 웹페이지로 재구성했습니다.
MediaWiki 설치 없이 **순수 HTML/CSS/JS**로만 만들어서 
설치 마법사, DB, `.env`, `LocalSettings.php` 같은  과정이 전혀 없습니다. 

IDE 환경에서 코드를 열어 바로 수정하고, Docker로 실행만 하면 됩니다.

## 폴더 구조 (처음 git push했을 때 구조이며, 이 구조를 기반으로 웹페이지를 추가했습니다.)

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

## 프로젝트 참고 사항 및 AI 활용 내역
- 데이터 보안: Claude(무료 기본 버전: Sonnet 5) 및 ChatGPT(무료 기본 버전:GPT-5.5 Instant~GPT-5.6 Luna) 활용 시, 입력 데이터의 비식별화 전처리 및 AI 학습 방지(Opt-out) 설정을 적용하여 보안을 중시했습니다.

- 역할 분담: 핵심 로직 구현은 직접 수행하였으며, 앱과 웹 개발 및 시각화 처리, 기본 데이터 분석 코드 작성 및 문서 검증 과정에서 AI를 보조 도구로 병행 활용했습니다.   

- 한계점 및 대응: 온톨로지 비식별화 방식에 대한 이해 부족으로 인해, Opt-out 상태에서 공개된 인터넷 문서를 원 데이터로 삼았습니다. 또한 이번 포트폴리오에 포함된 DS 계열 또한 김소월 시처럼 공개된 인터넷 문서에 적용했습니다.

## 참고 문헌

- 김현 (2012). 인문정보학의 모색. 북코리아.
- 김바로. (2017). *제도와 인사의 관계성 데이터 아카이브 구축과 활용: 근대 학교 자료(1895~1910)를 중심으로* [박사학위논문, 한국학중앙연구원 한국학대학원].
- 김현, 김바로, 임영상 (2016). 디지털 인문학 입문. 한국외국어대학교지식출판원.   
- 김바로 (2018). 『시맨틱 데이터 아카이브의 구축과 활용. 디지털인문학연구총서 6. 보고사.   
- AKS 디지털인문학연구소. ["온톨로지 설계 방법"](https://dh.aks.ac.kr/Edu/wiki/index.php/온톨로지_설계_방법)
- 류인태, 곽지은, 권기성, 김바로, 김병준, 김지선, 박진호, 양승목, 이민철, 이재연, 장문석, 지영원, 한희연 (2023). 디지털로 읽고 데이터로 쓰다: 디지털 한국어문학의 모색. 성균한국어문학총서 2. 휴머니스트.
- Tuominen, J., Hyvönen, E., & Leskinen, P. (2018). Bio CRM: A data model for representing biographical data for prosopographical research. In A. Fokkens, S. ter Braake, R. Sluijter, P. Arthur, & E. Wandl-Vogt (Eds.), *Proceedings of the Second Conference on Biographical Data in a Digital World 2017 (BD2017)* (pp. 59–66). RWTH Aachen University. http://ceur-ws.org/Vol-2119/paper10.pdf
(Baro. (2025, May 21). BioCRM: 인물 생애 정보 기술을 위한 데이터 모델. 한국디지털인문학협의회 (KADH). https://www.kadh.org/biocrm-%EC%9D%B8%EB%AC%BC-%EC%83%9D%EC%95%A0-%EC%A0%95%EB%B3%B4-%EA%B8%B0%EC%88%A0%EC%9D%84-%EC%9C%84%ED%95%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EB%AA%A8%EB%8D%B8/)
- 김바로. (2026년 5월 11일). *지식 그래프 기반 근대 인물 LOD 구축 및 LLM 연계를 위한 지식 보충 생성(KAG) 모델 연구*. 한국디지털인문학협의회(KADH). KADH 연구과제 소개 페이지.
