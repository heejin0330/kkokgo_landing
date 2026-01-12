This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


---

```mermaid
graph TD
    %% 스타일 정의 %%
    classDef start fill:#1e293b,stroke:#64748b,color:#fff,stroke-width:2px;
    classDef process fill:#0f172a,stroke:#334155,color:#fff,stroke-dasharray: 5 5;
    classDef highlight fill:#172554,stroke:#3b82f6,color:#fff,stroke-width:3px;
    classDef conversion fill:#1e1b4b,stroke:#a855f7,color:#fff,stroke-width:4px,shape:hexagon;
    classDef wow fill:#022c22,stroke:#22c55e,color:#fff,stroke-width:3px;
    classDef viral fill:#3f6212,stroke:#84cc16,color:#fff;

    %% 1단계: 유입 %%
    subgraph Stage1_유입 [1. 호기심 자극 단계]
        A["📢 유입 경로"] -->|"친구 카톡/박람회 QR"| B("🤔 나도 AI로 진로 찾아볼까?")
        B --> C{"🚀 서비스 접속"}
    end

    %% 2단계: 몰입 %%
    subgraph Stage2_몰입 [2. 게이미피케이션 진단]
        C --> D["🎮 쉽고 빠른 테스트 진행"]
        D -- "공부 얘기 아님/MBTI 방식" --> E("🤩 오 재밌는데? 몰입 완료")
    end

    %% 3단계: 티징 (Hook) %%
    subgraph Stage3_티징 [3. 결과 맛보기 & 미끼 투척]
        E --> F["✨ 1차 결과 화면 노출"]
        F --> G["👤 나의 페르소나 발견<br>'천재 해커' / '강철 엔지니어'"]
        G --> H{"🔒 핵심 정보 잠김 상태!"}
        H -- "추천학과 5개 중 3개 블러 처리" --> I("🤯 궁금해서 미침<br>아, 진짜 좋은 건 숨겨놨네?")
    end

    %% 4단계: 전환 (Conversion) %%
    subgraph Stage4_전환 [4. 가치 교환의 순간]
        I --> J{{🗝️ 잠금 해제 시도}}
        J -- "정보를 얻기 위해 기꺼이 입력" --> K["📱 전화번호 입력 & 약관 동의"]
        K -- "DB 확보 완료 (Lead Gen)" --> L("✅ 해제 완료!")
    end

    %% 5단계: 와우 모멘트 (AHA!) %%
    subgraph Stage5_확신 [5. 압도적 데이터 제공]
        L --> M["🔓 상세 리포트 대방출"]
        M --> N["🏆 Top-tier 마이스터고 매칭"]
        N --> O["📊 팩트 폭격 데이터 노출<br>취업률 97% / 연봉 5천 / 삼성전자 입사"]
        O --> P("😲 인식의 전환!<br>헐, 애매한 대학보다 훨씬 낫네?")
    end

    %% 6단계: 바이럴 확산 %%
    subgraph Stage6_확산 [6. 자발적 공유 루프]
        P --> Q{"📣 공유하기 액션"}
        
        %% 자녀의 확산 경로 %%
        Q -- "학생 Path: 선언" --> R["💬 부모님께 직구 날리기<br>엄마, 나 여기(스마트팜과) 갈래요!"]
        R --> S("👨‍👩‍👧‍👦 부모의 확인 & 놀람")

        %% 부모의 확산 경로 %%
        S -- "부모 Path: 자랑 & 정보공유" --> T["📝 맘카페/학부모 커뮤니티 공유"]
        T -- "교육부 데이터/NCS 근거 캡처" --> U("🔥 2차 바이럴 & 신뢰 형성")
    end

    %% 스타일 적용 %%
    class A,B,C start;
    class D,E process;
    class F,G,H,I highlight;
    class J,K,L conversion;
    class M,N,O,P wow;
    class Q,R,S,T,U viral;