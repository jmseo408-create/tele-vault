# TeleVault

Obsidian 사이드 패널 안에서 Telegram Web 을 그대로 사용할 수 있게 해주는 플러그인입니다. Electron 의 `<webview>` 태그를 이용해 `web.telegram.org` 를 임베드하며, 로그인 세션은 Obsidian 을 재시작해도 유지됩니다.

## 주요 기능

- **사이드 패널 임베드**: 오른쪽 leaf 에 Telegram Web 전체 기능(채팅, 미디어 전송, 음성 통화 등)을 그대로 표시
- **세션 영속화**: `partition="persist:televault"` 로 로그인 상태 유지 (Obsidian 재시작 후에도 재로그인 불필요)
- **리본 아이콘**: 좌측 리본의 종이비행기 아이콘 클릭으로 패널 토글
- **커맨드 팔레트**:
  - `TeleVault: Telegram 패널 열기`
  - `TeleVault: Telegram 패널 새로고침`
- **툴바 버튼**: 패널 상단에서 새로고침 / 홈 이동
- **설정 탭**:
  - Telegram URL 변경 (예: `https://web.telegram.org/k/`, `https://web.telegram.org/a/`)
  - Obsidian 시작 시 자동으로 패널 열기
- **데스크톱 전용**: `isDesktopOnly: true` 로 모바일에서는 비활성화 (Electron webview 가 모바일에서 동작하지 않음)

## 설치 방법

### 1. 저장소 클론

```powershell
cd C:\dev
git clone https://github.com/<유저명>/tele-vault.git
cd tele-vault
```

### 2. 빌드

```powershell
npm install
npm run build
```

빌드가 끝나면 폴더에 `main.js` 파일이 생성됩니다.

### 3. 볼트에 배포

```powershell
$dest = "G:\내 드라이브\Obsidian\Brain\.obsidian\plugins\tele-vault"
New-Item -ItemType Directory -Force -Path $dest
Copy-Item main.js, manifest.json, styles.css -Destination $dest
```

### 4. 활성화

1. Obsidian 실행
2. `설정` → `커뮤니티 플러그인` → `설치된 플러그인` 목록에서 **TeleVault** 토글 ON
3. 리본에 나타난 종이비행기 아이콘 클릭 또는 `Ctrl+P` → `TeleVault: Telegram 패널 열기`

## 사용법

### 최초 로그인

1. 패널을 열면 Telegram Web 로그인 화면이 나타남
2. 휴대폰 번호 입력 → Telegram 앱으로 전송된 코드 입력
3. 로그인 완료 후 세션은 자동으로 저장되어 다음 실행부터는 바로 대화 화면으로 진입

### 패널 조작

| 동작          | 방법                                                              |
| ------------- | ----------------------------------------------------------------- |
| 패널 열기     | 리본 아이콘 클릭 / 커맨드 팔레트 / `시작 시 자동 열기` 옵션 ON   |
| 새로고침      | 상단 `새로고침` 버튼 또는 `TeleVault: Telegram 패널 새로고침`   |
| 홈으로 이동   | 상단 `홈` 버튼 (설정에 지정한 기본 URL 로 복귀)                 |
| 패널 닫기     | 사이드 패널 탭 우클릭 → `닫기` (일반 Obsidian 뷰와 동일)        |

### 설정

`설정 → 커뮤니티 플러그인 → TeleVault → 설정` 에서 조정 가능:

- **Telegram URL**: 기본값 `https://web.telegram.org/a/` (신형 UI). 구 버전을 원하면 `https://web.telegram.org/k/` 로 변경
- **시작 시 자동 열기**: Obsidian 실행 시마다 자동으로 패널을 엽니다

## 제거 방법

### 방법 1: Obsidian 설정에서 제거 (권장)

1. `설정` → `커뮤니티 플러그인`
2. **TeleVault** 옆 토글 OFF (비활성화)
3. 플러그인 이름 클릭 → `제거` 버튼 클릭

### 방법 2: 파일 직접 삭제

볼트 내부 플러그인 폴더를 통째로 삭제합니다.

```
<your-vault>/.obsidian/plugins/tele-vault/  ← 이 폴더 삭제
```

> **참고**: 제거해도 Telegram 로그인 세션(쿠키)은 Obsidian `userData` 경로에 남을 수 있습니다. 완전히 초기화하려면 아래 명령어로 세션 폴더를 삭제하세요.

### 세션 완전 삭제 (쿠키 · 로그인 정보 초기화)

**Windows (PowerShell)**

```powershell
Remove-Item -Recurse -Force "$env:APPDATA\obsidian\Partitions\persist_televault" -ErrorAction SilentlyContinue
```

**macOS (Terminal)**

```bash
rm -rf ~/Library/Application\ Support/obsidian/Partitions/persist_televault
```

**Linux (Terminal)**

```bash
rm -rf ~/.config/obsidian/Partitions/persist_televault
```

> 위 폴더가 없으면 이미 세션이 없는 상태이므로 무시해도 됩니다.

## 개발

watch 모드로 실행하면 `main.ts` 수정 시 `main.js` 가 자동 재빌드됩니다.

```bash
npm run dev
```

볼트 내부 플러그인 폴더에 심볼릭 링크를 걸어두면 편리합니다. 수정 반영은 Obsidian 에서 `Ctrl+P` → `Reload app without saving`.

## 파일 구조

```
TeleVault/
├── manifest.json        # 플러그인 메타데이터
├── versions.json        # Obsidian 최소 버전 매핑
├── package.json         # npm 의존성 / 스크립트
├── tsconfig.json        # TypeScript 설정
├── esbuild.config.mjs   # 번들러 설정
├── main.ts              # 엔트리 포인트 (ItemView + Settings)
├── styles.css           # 패널 스타일
└── .gitignore
```

## 트러블슈팅

**패널이 빈 화면으로 나타남**
- 인터넷 연결 확인 후 `새로고침` 버튼 클릭
- `partition` 값이 저장소 문제를 일으키는 경우 매우 드물게 발생 — `설정`에서 URL 을 잠시 다른 값으로 바꿨다가 되돌리면 초기화됨

**로그인이 매번 풀림**
- Obsidian 이 `userData` 경로에 쓰기 권한이 없는 경우 발생. 관리자 권한으로 실행 중이거나 포터블 설치면 경로를 확인

**모바일에서 동작하지 않음**
- 의도된 제약. Electron `<webview>` 는 Obsidian 모바일(Capacitor)에서 지원되지 않음

**소리/알림이 나지 않음**
- 브라우저 알림 권한을 한 번 허용해야 함. Telegram Web 설정에서 `Notifications` 활성화 후 Obsidian 에서 권한 팝업 수락

## 보안 고려사항

- `persist:televault` partition 은 Obsidian 설정 폴더 내부에 Telegram 쿠키/세션을 저장합니다. 공용 PC 에서는 사용에 주의
- 모든 트래픽은 Telegram 공식 서버(`web.telegram.org`)로 직접 전송되며, 플러그인은 별도의 중간 서버를 경유하지 않음
- 소스는 오픈되어 있으므로 `main.ts` 를 직접 검토 가능

## 라이선스

MIT
