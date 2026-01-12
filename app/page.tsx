"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import {
  Circle,
  X,
  Sparkles,
  TrendingUp,
  Phone,
  Share2,
  CheckCircle,
  Building2,
  Briefcase,
  GraduationCap,
  Lock,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import {
  questionBank,
  type HollandType,
  type Question,
} from "./data/questions";

// ------------------------------------------------------------------
// [0] TypeScript 타입 정의
// ------------------------------------------------------------------
type ScoreType = Record<HollandType, number>;

interface ResultStats {
  employmentRate: string;
  companies: string;
  salary: string;
}

interface ResultReport {
  recommendSchool: string;
  ncsField: string;
  stats: ResultStats;
  manual: string;
}

interface ResultDataType {
  type: string;
  title: string;
  emoji: string;
  desc: string;
  majors: string[];
  report: ResultReport;
}

type ResultDataMap = Record<HollandType, ResultDataType>;

interface PremiumContent {
  summary: string;
  roadmap: string;
}

// [수정] 호칭 개선 (대표님 -> 자연스러운 문구)
const PREMIUM_MESSAGES: Record<HollandType, PremiumContent> = {
  R: {
    summary:
      "손재주가 뛰어난 **실재형(R)** 성향이 강해, 머리보다 손으로 결과를 만드는 엔지니어 기질이 탁월합니다.",
    roadmap:
      "마이스터고 진학 후 **기계설계산업기사** 자격증 취득 시, 공기업 기술직 합격률이 60% 이상 상승합니다.",
  },
  I: {
    summary:
      "논리적인 **탐구형(I)** 성향이 가장 강하며, 복잡한 문제를 파고들어 해결하는 **연구원/개발자** 잠재력이 높습니다.",
    roadmap:
      "SW마이스터고 진학 후 **알고리즘 동아리** 활동을 추천하며, **정보처리기능사** 취득 시 대기업 개발직군 서류 통과율이 급상승합니다.",
  },
  A: {
    summary:
      "감각적인 **예술형(A)** 재능이 뛰어나, 남들과 다른 창의적인 아이디어를 내는 **크리에이터/디자이너** 기질이 있습니다.",
    roadmap:
      "디자인/콘텐츠 특성화고 진학 후 **GTQ 1급** 및 포트폴리오를 1학년부터 준비하면 홍대/한예종 진학 가능성이 열립니다.",
  },
  S: {
    summary:
      "공감 능력이 좋은 **사회형(S)** 성향이 높아, 타인의 감정을 이해하고 돕는 **보건/상담/교육** 분야에서 빛을 발합니다.",
    roadmap:
      "보건/관광 특성화고 진학 후 **간호조무사** 또는 **관광통역안내사** 자격을 준비하면 병원 및 공공기관 취업이 유리합니다.",
  },
  E: {
    summary:
      "추진력 있는 **진취형(E)** 리더십이 강해, 조직을 이끌고 목표를 달성하는 **CEO/마케터** 기질을 타고났습니다.",
    roadmap:
      "상업/경영 고교 진학 후 **전산회계** 자격증과 **학생회장** 활동을 병행하면 금융권 및 공기업 고졸 공채 합격 전략이 완성됩니다.",
  },
  C: {
    summary:
      "꼼꼼한 **관습형(C)** 성향으로, 체계적이고 정확한 일 처리가 돋보이는 **금융/행정 전문가** 인재입니다.",
    roadmap:
      "세무/회계 특성화고 진학 후 **전산세무 2급**을 취득하면, 세무 공무원 및 대기업 재무팀 취업의 지름길이 열립니다.",
  },
};

// [수정] resetTest 추가하여 타입 에러 해결
interface UseTestLogicReturn {
  questions: Question[];
  currentIndex: number;
  handleSwipe: (direction: string, questionType: HollandType) => void;
  getResult: () => HollandType;
  scores: ScoreType;
  progress: number;
  initTest: (mode: "basic" | "premium") => void;
  resetTest: () => void;
}

// ------------------------------------------------------------------
// 유효한 Holland 타입인지 검증하는 헬퍼 함수
// ------------------------------------------------------------------
const VALID_HOLLAND_TYPES: HollandType[] = ["R", "I", "A", "S", "E", "C"];

function isValidHollandType(value: string | null): value is HollandType {
  return value !== null && VALID_HOLLAND_TYPES.includes(value as HollandType);
}

// 통합 결과 데이터 (RESULT_DATA)
const RESULT_DATA: ResultDataMap = {
  R: {
    type: "실재형 (R)",
    title: "마이더스의 손",
    emoji: "🛠️",
    desc: "손만 대면 고쳐내는 금손의 소유자!",
    majors: [
      "🚁 드론공간정보과",
      "🔧 기계설계과",
      "🤖 로봇제어과",
      "⚙️ 정밀기계과",
      "✈️ 항공정비과",
    ],
    report: {
      recommendSchool: "수도전기공업고등학교",
      ncsField: "에너지·기계 직무",
      stats: {
        employmentRate: "97.7%",
        companies: "한국전력, 삼성전자, 현대차",
        salary: "초봉 4,000만원↑ (공기업)",
      },
      manual:
        "이론 공부보다 실습이 훨씬 재밌죠? 마이스터고 가면 내신 5등급도 대기업 기술직으로 골인할 수 있습니다.",
    },
  },
  I: {
    type: "탐구형 (I)",
    title: "천재 해커",
    emoji: "💻",
    desc: "10시간 걸릴 일을 10분 컷하는 효율맨!",
    majors: [
      "💻 소프트웨어과",
      "🔋 이차전지과",
      "🛡️ 정보보호과",
      "🧠 인공지능과",
      "💊 바이오제약과",
    ],
    report: {
      recommendSchool: "대덕소프트웨어마이스터고",
      ncsField: "정보통신·SW 직무",
      stats: {
        employmentRate: "92.1%",
        companies: "토스(Toss), 배민, 금융감독원",
        salary: "개발자 초봉 5,000만원↑",
      },
      manual:
        "애매한 대학 컴공과보다 낫습니다. 졸업과 동시에 '네카라쿠배' 개발자로 취업하거나 SKY 대학으로 진학하는 케이스가 많아요.",
    },
  },
  A: {
    type: "예술형 (A)",
    title: "트렌드 세터",
    emoji: "🎨",
    desc: "숨만 쉬어도 힙한 감각적인 아티스트!",
    majors: [
      "🎨 웹툰창작과",
      "🎤 K-POP콘텐츠과",
      "🖌️ 시각디자인과",
      "🎮 게임그래픽과",
      "🏠 실내건축과",
    ],
    report: {
      recommendSchool: "한국애니메이션고등학교",
      ncsField: "디자인·문화콘텐츠 직무",
      stats: {
        employmentRate: "진학률 85%↑",
        companies: "네이버웹툰, 한예종/홍익대 진학",
        salary: "업계 탑티어 포트폴리오",
      },
      manual:
        "입시 미술 하느라 돈 쓰는 대신, 학교에서 웹툰 그리고 게임 만들면서 바로 프로 데뷔 준비하세요.",
    },
  },
  S: {
    type: "사회형 (S)",
    title: "핵인싸 아이돌",
    emoji: "💖",
    desc: "어딜 가나 사랑받는 분위기 메이커!",
    majors: [
      "🚑 응급구조과",
      "👶 유아교육과",
      "💉 보건간호과",
      "🏛️ 공공행정과",
      "✈️ 관광경영과",
    ],
    report: {
      recommendSchool: "서울관광고등학교",
      ncsField: "보건·복지·서비스 직무",
      stats: {
        employmentRate: "공무원 합격 다수",
        companies: "9급 공무원, 대학병원, 호텔리어",
        salary: "안정적인 공무원 연금",
      },
      manual:
        "남들 공무원 시험 준비할 때, 특성화고 특채로 20살에 9급 공무원 되는 지름길이 있습니다.",
    },
  },
  E: {
    type: "진취형 (E)",
    title: "영앤리치 CEO",
    emoji: "👑",
    desc: "떡잎부터 남다른 야망가!",
    majors: [
      "📈 금융경영과",
      "📹 1인크리에이터과",
      "💰 금융회계과",
      "🛍️ 라이브커머스과",
      "📢 마케팅과",
    ],
    report: {
      recommendSchool: "서울여자상업고등학교",
      ncsField: "경영·금융 직무",
      stats: {
        employmentRate: "100% (취업희망자)",
        companies: "한국은행, 금감원, 5대 시중은행",
        salary: "금융권 초봉 5,000만원↑",
      },
      manual:
        "인서울 상경계열 나와도 힘든 '금융권 A매치' 공기업 취업, 여기선 학교 추천으로 갑니다.",
    },
  },
  C: {
    type: "관습형 (C)",
    title: "인간 AI",
    emoji: "🤖",
    desc: "실수란 없다, 걸어 다니는 계산기!",
    majors: [
      "📊 금융빅데이터과",
      "🏢 세무행정과",
      "📦 스마트물류과",
      "📂 공공사무행정과",
      "🧾 세무회계과",
    ],
    report: {
      recommendSchool: "선린인터넷고등학교",
      ncsField: "경영지원·사무행정 직무",
      stats: {
        employmentRate: "대입/취업 선택형",
        companies: "공공기관, 대기업 재무팀",
        salary: "안정성 끝판왕 직무",
      },
      manual:
        "숫자에 밝고 정리를 잘하나요? 기업의 안살림을 책임지는 핵심 인재로 모셔갑니다.",
    },
  },
};

// ------------------------------------------------------------------
// 1️⃣ HexagonChart 컴포넌트
// ------------------------------------------------------------------
const HexagonChart = ({ scores }: { scores: ScoreType }) => {
  const values = Object.values(scores) as number[];
  const maxScore = values.length > 0 ? Math.max(...values, 10) : 10;

  const types: HollandType[] = ["R", "I", "A", "S", "E", "C"];

  const getPoint = (value: number, index: number, max: number) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    const radius = (value / max) * 80;
    const x = Math.cos(angle) * radius + 100;
    const y = Math.sin(angle) * radius + 100;
    return `${x},${y}`;
  };

  const points = types
    .map((type, i) => getPoint(scores[type] || 0, i, maxScore))
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center my-6">
      <div className="relative w-[200px] h-[200px]">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full transform rotate-0 overflow-visible"
        >
          {[20, 40, 60, 80, 100].map((r, idx) => (
            <polygon
              key={idx}
              points={types.map((_, i) => getPoint(r, i, 100)).join(" ")}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          ))}
          {types.map((_, i) => {
            const p = getPoint(100, i, 100);
            return (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={p.split(",")[0]}
                y2={p.split(",")[1]}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            );
          })}
          <motion.polygon
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            points={points}
            fill="rgba(163, 230, 53, 0.3)"
            stroke="#a3e635"
            strokeWidth="2"
            className="drop-shadow-[0_0_10px_rgba(163,230,53,0.5)]"
          />
          {types.map((type, i) => {
            const [x, y] = getPoint(scores[type] || 0, i, maxScore).split(",");
            return <circle key={i} cx={x} cy={y} r="3" fill="#a3e635" />;
          })}
        </svg>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-6 text-[11px] text-gray-300 font-bold">
          현실(R)
        </div>
        <div className="absolute top-[25%] right-0 -mr-6 text-[11px] text-gray-300 font-bold">
          탐구(I)
        </div>
        <div className="absolute bottom-[25%] right-0 -mr-6 text-[11px] text-gray-300 font-bold">
          예술(A)
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-6 text-[11px] text-gray-300 font-bold">
          사회(S)
        </div>
        <div className="absolute bottom-[25%] left-0 -ml-6 text-[11px] text-gray-300 font-bold">
          진취(E)
        </div>
        <div className="absolute top-[25%] left-0 -ml-6 text-[11px] text-gray-300 font-bold">
          관습(C)
        </div>
      </div>
    </div>
  );
};

// 팩맨 프로그레스 바
const PacmanProgress = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => {
  const progress = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="w-full max-w-md mx-auto mb-8 px-2">
      <div className="relative h-8 flex items-center justify-between">
        <div className="absolute inset-0 flex items-center justify-between px-1">
          {Array.from({ length: total }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx < current
                  ? "bg-transparent scale-0"
                  : "bg-white/20 scale-100"
              }`}
            />
          ))}
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out z-10"
          style={{ left: `${progress}%`, marginLeft: "-12px" }}
        >
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-pulse"></div>
            <div
              className="absolute inset-0 bg-yellow-400 rounded-full"
              style={{
                clipPath: "polygon(100% 0%, 100% 100%, 50% 50%, 0% 50%, 0% 0%)",
                transform: "rotate(-45deg)",
              }}
            ></div>
            <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="text-right text-[10px] text-gray-500 mt-1 font-mono">
        STAGE {current} / {total}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// [1] Supabase 클라이언트 설정
// ------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function getRandomMajors(type: HollandType, count = 2): string[] {
  const majors = [...RESULT_DATA[type].majors];
  const selected: string[] = [];
  for (let i = 0; i < count && majors.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * majors.length);
    selected.push(majors.splice(randomIndex, 1)[0]);
  }
  return selected;
}

// 질문 셔플 함수 개선: mode에 따라 문항 수 조절
function generateShuffledQuestions(isPremium: boolean): Question[] {
  const types: HollandType[] = ["R", "I", "A", "S", "E", "C"];
  const selected: Question[] = [];

  // 기본(Basic): 유형별 2개 (총 12개)
  // 프리미엄(Premium): 유형별 전체 (또는 10개)
  const countPerType = isPremium ? 10 : 2;

  types.forEach((type) => {
    const filtered = questionBank.filter((q) => q.type === type);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, countPerType));
  });
  return selected.sort(() => Math.random() - 0.5);
}

// 텍스트 포맷팅 헬퍼 (굵은 글씨)
const formatText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const loadingMessages = [
  "🏫 전국 마이스터고/특성화고 커리큘럼 분석 중...",
  "💼 졸업생 실제 취업 데이터 대조 중...",
  "📊 나의 성향과 학과 적합도 매칭 중...",
];

// ------------------------------------------------------------------
// [3] Hook: 테스트 로직
// ------------------------------------------------------------------
function useTestLogic(): UseTestLogicReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<ScoreType>({
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  });
  const [startTime, setStartTime] = useState<number | null>(null);

  // 초기화 함수: 모드에 따라 문제 세팅
  const initTest = useCallback((mode: "basic" | "premium") => {
    const isPremium = mode === "premium";
    setQuestions(generateShuffledQuestions(isPremium));
    setCurrentIndex(0);
    setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
    setStartTime(Date.now());
  }, []);

  // 최초 로드 시 기본 테스트 시작
  useEffect(() => {
    initTest("basic");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwipe = useCallback(
    (direction: string, questionType: HollandType) => {
      if (direction === "right") {
        const elapsed = Date.now() - (startTime || Date.now());
        const points = elapsed < 2000 ? 1.5 : 1;
        setScores((prev) => ({
          ...prev,
          [questionType]: prev[questionType] + points,
        }));
      }
      setCurrentIndex((prev) => prev + 1);
      setStartTime(Date.now());
    },
    [startTime]
  );

  const getResult = useCallback((): HollandType => {
    const entries = Object.entries(scores) as [HollandType, number][];
    const maxScore = Math.max(...entries.map(([, score]) => score));
    const winners = entries.filter(([, score]) => score === maxScore);
    const [type] = winners[Math.floor(Math.random() * winners.length)];
    return type;
  }, [scores]);

  const progress = useMemo(
    () => (questions.length > 0 ? (currentIndex / questions.length) * 100 : 0),
    [currentIndex, questions.length]
  );

  return {
    questions,
    currentIndex,
    handleSwipe,
    getResult,
    scores,
    progress,
    resetTest: () => initTest("basic"),
    initTest,
  };
}

// ------------------------------------------------------------------
// [4] 하위 컴포넌트들
// ------------------------------------------------------------------
function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-14 sm:h-16 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10">
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-[420px] px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tighter text-white">
            kkokgo
          </h1>
        </div>
      </div>
    </header>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 text-lime-400 mb-4 sm:mb-6 mx-auto" />
      </motion.div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-white leading-tight">
        나에게 딱 맞는
        <br />
        고등학교 학과 찾기
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 font-bold">
        인문계? 특성화고? 내 적성은 어디일까?
        <br />
        (AI 진로 분석) 🔥
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="px-8 sm:px-12 py-4 sm:py-5 bg-lime-400 text-black rounded-full text-lg sm:text-xl font-black shadow-[0_0_20px_rgba(163,230,53,0.6)]"
      >
        시작하기 →
      </motion.button>
    </motion.div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setLoadingMessage(loadingMessages[randomIndex]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white/10 h-2 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-lime-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <motion.div
        key={loadingMessage}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="text-center text-lime-400 text-xs sm:text-sm font-bold"
      >
        {loadingMessage}
      </motion.div>
    </div>
  );
}

function SwipeCard({
  question,
  onSwipe,
}: {
  question: Question;
  onSwipe: (dir: string) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      className="absolute w-full max-w-sm"
      role="region"
      aria-label={`질문: ${question.text}`}
    >
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-center">🤔</div>
        <p className="text-lg sm:text-xl font-bold text-white leading-relaxed text-center">
          {question.text}
        </p>
      </div>
    </motion.div>
  );
}

function ResultView({
  resultType,
  scores,
  isPremiumMode,
  initialUnlocked = false,
  onStartPremiumTest,
  onRestart,
}: {
  resultType: HollandType;
  scores: ScoreType | null;
  isPremiumMode: boolean;
  initialUnlocked?: boolean;
  onStartPremiumTest: () => void;
  onRestart: () => void;
}) {
  const data = RESULT_DATA[resultType];
  const [selectedMajors] = useState(() => getRandomMajors(resultType, 2));
  const [phone, setPhone] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(initialUnlocked);

  if (!data) return null;

  const handleUnlock = async () => {
    if (!privacyConsent) {
      alert("개인정보 활용동의를 해주세요.");
      return;
    }
    const phoneRegex = /^01[0-9]\d{7,8}$/;
    const cleanPhone = phone.replace(/-/g, "");
    if (!phone || !phoneRegex.test(cleanPhone)) {
      alert("올바른 휴대폰 번호 형식이 아닙니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const majorText = selectedMajors.join(", ");
      const { error } = await supabase.from("pre_orders").insert([
        {
          phone: cleanPhone,
          major: majorText,
          result_type: resultType,
          marketing_consent: marketingConsent,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      const smsResponse = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          resultType: resultType,
          resultTitle: data.title,
        }),
      });

      if (!smsResponse.ok) {
        console.error("SMS 발송 실패:", await smsResponse.text());
        alert("데이터는 저장되었으나 문자 발송에 일시적인 문제가 있습니다.");
      }
      setIsUnlocked(true);
    } catch (error) {
      console.error(error);
      let msg = "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      if (typeof error === "object" && error !== null && "code" in error) {
        if ((error as any).code === "23505") {
          msg = "이미 등록된 전화번호입니다.";
        }
      }
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    let shareUrl = window.location.href;
    if (!shareUrl.includes("type=")) {
      shareUrl = `${window.location.origin}${window.location.pathname}?type=${resultType}`;
    }
    const shareData = {
      title: `나는 ${data.title}!`,
      text: `${data.desc} ${data.title} ${data.emoji}\n나의 숨겨진 재능을 찾아보세요!`,
      url: shareUrl,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareUrl);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {}
  };

  const handlePremiumClick = () => {
    const confirmMsg =
      "🎉 [베타 서비스 혜택]\n\n지금은 정밀 진단(60문항) 기능 오픈 기념으로\n1,000원 결제 없이 무료로 진행됩니다!\n\n바로 60문항 검사를 시작하시겠습니까?";
    if (confirm(confirmMsg)) {
      onStartPremiumTest();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-full flex flex-col items-center justify-center p-4 sm:p-6 py-8"
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        className="text-6xl sm:text-7xl md:text-8xl mb-4 sm:mb-6"
      >
        {data.emoji}
      </motion.div>

      <h2 className="text-xl sm:text-2xl font-bold text-gray-300 mb-1 sm:mb-2">
        {data.desc}
      </h2>
      <span className="text-lime-400 text-xs font-bold border border-lime-400/30 rounded-full px-3 py-1 mb-2">
        TYPE {resultType} : {data.type}
      </span>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 sm:mb-8 text-white">
        {data.title}
      </h1>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 mb-3 sm:mb-4 shadow-2xl">
        <div className="text-center mb-3">
          <p className="text-xs text-lime-400 font-bold mb-1">
            {isUnlocked
              ? "🎉 맞춤 추천 학과 전체 공개!"
              : "✨ AI가 분석한 맞춤 추천 학과"}
          </p>
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {isUnlocked ? (
            data.majors.map((major: string, index: number) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 sm:px-4 py-2 bg-white/10 rounded-full text-lime-400 font-bold text-xs sm:text-sm border border-lime-400/30"
              >
                {major}
              </motion.span>
            ))
          ) : (
            <>
              {selectedMajors.map((major: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="px-3 sm:px-4 py-2 bg-white/10 rounded-full text-lime-400 font-bold text-xs sm:text-sm border border-lime-400/30"
                >
                  {major}
                </motion.span>
              ))}
              {[1, 2, 3].map((_, index) => (
                <motion.span
                  key={`locked-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 2) * 0.15 }}
                  className="relative px-3 sm:px-4 py-2 bg-white/5 rounded-full text-gray-500 font-bold text-xs sm:text-sm border border-white/10"
                >
                  <span className="blur-[3px] select-none">🔒 ??? 학과</span>
                  <span className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <Lock className="w-3 h-3" />
                  </span>
                </motion.span>
              ))}
            </>
          )}
        </div>
      </div>

      {isUnlocked ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-gradient-to-br from-lime-400/10 to-emerald-400/10 backdrop-blur-xl border border-lime-400/30 rounded-3xl p-5 sm:p-6 mb-4 sm:mb-6 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-lime-400" />
            <h3 className="text-lg sm:text-xl font-black text-white">
              📋 맞춤 진학 리포트
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl">
              <GraduationCap className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">추천 학교</p>
                <p className="text-white font-bold text-sm sm:text-base">
                  {data.report.recommendSchool}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl">
              <Briefcase className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">NCS 직무 분야</p>
                <p className="text-white font-bold text-sm sm:text-base">
                  {data.report.ncsField}
                </p>
              </div>
            </div>
            {/* [수정] 복구된 취업 현황 섹션 */}
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl">
              <Building2 className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">취업 현황</p>
                <p className="text-white font-bold text-sm sm:text-base">
                  취업률 {data.report.stats.employmentRate}
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  {data.report.stats.companies}
                </p>
                <p className="text-lime-400 text-xs mt-1 font-bold">
                  💰 {data.report.stats.salary}
                </p>
              </div>
            </div>
            <div className="p-4 bg-lime-400/10 rounded-2xl border border-lime-400/20">
              <p className="text-xs text-lime-400 font-bold mb-2">
                💡 진로 전문가 코멘트
              </p>
              <p className="text-white text-sm leading-relaxed">
                {data.report.manual}
              </p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="w-full mt-4 py-3 sm:py-4 bg-lime-400 text-black rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.4)]"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            친구에게 내 결과 공유하기 🔗
          </button>
        </motion.div>
      ) : (
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400 flex-shrink-0" />
            <div className="text-white font-bold text-sm sm:text-base leading-snug">
              <p className="mb-1">
                고등학교 <span className="text-lime-400">꼭 일반고</span>를
                가야할까?
              </p>
              <p className="text-xs sm:text-sm text-gray-300">
                내 적성에 맞는{" "}
                <span className="text-lime-400">마이스터고, 특성화고</span>{" "}
                추천리스트 받기 👇
              </p>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 font-bold text-base sm:text-lg focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>
          <div className="mt-4 mb-4 px-1 space-y-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <div className="flex items-center h-5">
                  <input
                    id="privacy-consent"
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-lime-400 focus:ring-lime-400 bg-white/10"
                  />
                </div>
                <label
                  htmlFor="privacy-consent"
                  className="text-sm font-medium text-white cursor-pointer select-none"
                >
                  [필수] 개인정보 수집 및 이용 동의
                </label>
              </div>
              {/* [수정] 복구된 약관 상세 보기 */}
              <details className="ml-6 text-[11px] text-gray-400 cursor-pointer">
                <summary className="hover:text-gray-300 underline underline-offset-2">
                  약관 전체 보기 🔽
                </summary>
                <div className="p-3 mt-2 bg-black/40 rounded-xl border border-white/10 h-32 overflow-y-auto">
                  <p className="font-bold text-gray-300 mb-1">
                    [개인정보 수집 및 이용 동의]
                  </p>
                  1. 목적: 진로 분석 결과 발송 및 상담, 서비스 이용 확인
                  <br />
                  2. 항목: 휴대전화번호, 검사 결과 데이터
                  <br />
                  3. 기간: <strong>서비스 종료 또는 동의 철회 시까지</strong>
                  <br />
                  4. 권리: 동의를 거부할 수 있으나, 거부 시 결과 발송이
                  불가합니다.
                </div>
              </details>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex items-center h-5">
                <input
                  id="marketing-consent"
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-lime-400 focus:ring-lime-400 bg-white/10"
                />
              </div>
              <div className="text-xs sm:text-sm">
                <label
                  htmlFor="marketing-consent"
                  className="font-medium text-gray-300 select-none cursor-pointer"
                >
                  [선택] 정식 서비스 출시 알림 받기
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleUnlock}
            disabled={isSubmitting}
            className="w-full py-3 sm:py-4 bg-lime-400 text-black rounded-2xl font-black text-base sm:text-lg shadow-[0_0_20px_rgba(163,230,53,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "저장 중..."
              : "[무료] AI가 분석한 추천 학과 모두보기"}
          </button>
        </div>
      )}

      {/* 2️⃣ 정밀 리포트 (Fake Door -> Real Test Entry) 영역 */}
      {!isPremiumMode && (
        <div className="w-full max-w-md mt-6 p-1">
          <button
            onClick={handlePremiumClick}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl border border-white/20 shadow-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 skew-x-12 -ml-20 w-20"></div>
            <span className="text-white font-black text-lg flex items-center justify-center gap-2">
              🔒 정밀 적성 진단 (60문항) 보기
              <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                1,000원
              </span>
            </span>
            <p className="text-indigo-200 text-xs mt-1">
              나의 6각형 능력치 그래프 + 상세 합격 전략 포함
            </p>
          </button>
        </div>
      )}

      {isPremiumMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mt-6 bg-slate-900/80 border border-indigo-500/50 rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">💎 정밀 성향 분석</h3>
            <span className="text-xs text-indigo-400 border border-indigo-400/30 rounded-full px-2 py-1">
              Premium
            </span>
          </div>

          <HexagonChart
            scores={scores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }}
          />

          <div className="space-y-3 mt-4">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <h4 className="text-indigo-400 font-bold text-sm mb-1">
                📈 분석 요약
              </h4>
              <p className="text-gray-300 text-xs leading-relaxed">
                {formatText(PREMIUM_MESSAGES[resultType].summary)}
              </p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <h4 className="text-indigo-400 font-bold text-sm mb-1">
                🎓 추천 로드맵
              </h4>
              <p className="text-gray-300 text-xs leading-relaxed">
                {formatText(PREMIUM_MESSAGES[resultType].roadmap)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 모달들 (Toast, Popup 등 기존 코드 유지) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm sm:text-base z-50"
          >
            ✅ 링크가 복사되었습니다!
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={onRestart}
        className="mt-8 text-gray-400 underline font-bold text-base sm:text-lg hover:text-white transition-colors"
      >
        다시 테스트하기
      </button>
      <div className="text-center text-white/20 text-[10px] mt-6 sm:mt-8">
        © 2026 PADA Labs. All rights reserved.
      </div>
    </motion.div>
  );
}

function AnalyzingView({ onComplete }: { onComplete: () => void }) {
  const [progressValue, setProgressValue] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const analysisTexts = [
    "🧬 홀랜드(Holland) 적성 로직에 따른 응답 분석 중...",
    "🏫 전국 특성화고/마이스터고 데이터 대조 중...",
    "✨ 학과 매칭 완료! 잠시만 기다려주세요...",
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgressValue((prev) => (prev >= 100 ? 100 : prev + 100 / 30));
    }, 100);
    const timer1 = setTimeout(() => setTextIndex(1), 1000);
    const timer2 = setTimeout(() => setTextIndex(2), 2500);
    const timer3 = setTimeout(() => onComplete(), 3000);
    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8"
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-lime-400/20 flex items-center justify-center border-2 border-lime-400/50">
          <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-lime-400" />
        </div>
      </motion.div>
      <div className="w-full max-w-xs mb-8">
        <div className="bg-white/10 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-lime-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressValue}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="text-right mt-2 text-lime-400 font-mono text-sm">
          {Math.round(progressValue)}%
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={textIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-lime-400 font-mono text-sm sm:text-base font-bold leading-relaxed"
        >
          {analysisTexts[textIndex]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}

// ------------------------------------------------------------------
// [5] 메인 페이지 컴포넌트
// ------------------------------------------------------------------
export default function Home() {
  const [stage, setStage] = useState<"start" | "test" | "analyzing" | "result">(
    "start"
  );
  const {
    questions,
    currentIndex,
    handleSwipe,
    getResult,
    scores,
    progress,
    initTest,
  } = useTestLogic();
  const [finalResultType, setFinalResultType] = useState<HollandType | null>(
    null
  );
  const [isSharedLink, setIsSharedLink] = useState(false);

  const [isPremiumMode, setIsPremiumMode] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isTestComplete =
    currentIndex >= questions.length && questions.length > 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get("type");
      if (isValidHollandType(typeParam)) {
        setFinalResultType(typeParam);
        setIsSharedLink(true);
        setStage("result");
      }
    }
  }, []);

  useEffect(() => {
    if (isTestComplete && stage === "test") {
      const calculatedType = getResult();
      setFinalResultType(calculatedType);
      setIsSharedLink(false);
      setStage("analyzing");
    }
  }, [isTestComplete, stage, getResult]);

  const handleAnalysisComplete = useCallback(() => {
    setStage("result");
    if (typeof window !== "undefined" && finalResultType) {
      const newUrl = `${window.location.pathname}?type=${finalResultType}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [finalResultType]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (currentQuestion) handleSwipe(answer, currentQuestion.type);
    },
    [currentQuestion, handleSwipe]
  );

  const handleRestart = useCallback(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
    setFinalResultType(null);
    setIsSharedLink(false);
    setIsPremiumMode(false);
    initTest("basic");
    setStage("start");
  }, [initTest]);

  const handleStartPremiumTest = useCallback(() => {
    setIsPremiumMode(true);
    initTest("premium");
    setStage("test");
  }, [initTest]);

  const resultScores = isSharedLink ? null : scores;

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-900/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
      </div>

      <div className="relative z-10 h-full w-full flex justify-center overflow-y-auto">
        <div className="w-full max-w-[420px] h-full flex flex-col">
          <Header />
          <AnimatePresence mode="wait">
            {stage === "start" && (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 pt-14 sm:pt-16"
              >
                <StartScreen onStart={() => setStage("test")} />
              </motion.div>
            )}
            {stage === "test" && !isTestComplete && (
              <motion.div
                key="test"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col pt-14 sm:pt-16"
              >
                <div className="flex-shrink-0 p-4 sm:p-6 pb-2">
                  <div className="text-white text-center mb-2 font-bold text-base sm:text-lg">
                    {isPremiumMode
                      ? "정밀 진단 진행 중..."
                      : "나의 잠재력 분석 중..."}{" "}
                    {Math.round(progress)}%
                  </div>
                  <ProgressBar progress={progress} />
                </div>
                <div className="flex-1 relative flex items-center justify-center px-4 sm:px-6 min-h-0">
                  <AnimatePresence>
                    {currentQuestion && (
                      <SwipeCard
                        key={currentQuestion.id}
                        question={currentQuestion}
                        onSwipe={handleAnswer}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex-shrink-0 px-4 sm:px-6 pb-2">
                  <PacmanProgress
                    current={currentIndex}
                    total={questions.length}
                  />
                </div>
                <div className="flex-shrink-0 flex gap-4 justify-center py-4 sm:py-6 pb-6 sm:pb-8">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAnswer("left")}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center"
                  >
                    <X
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      strokeWidth={4}
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAnswer("right")}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.6)] flex items-center justify-center"
                  >
                    <Circle
                      className="w-8 h-8 sm:w-10 sm:h-10 text-black"
                      strokeWidth={4}
                    />
                  </motion.button>
                </div>
              </motion.div>
            )}
            {stage === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 pt-14 sm:pt-16"
              >
                <AnalyzingView onComplete={handleAnalysisComplete} />
              </motion.div>
            )}
            {stage === "result" && finalResultType && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 pt-14 sm:pt-16 overflow-y-auto"
              >
                <ResultView
                  resultType={finalResultType}
                  scores={resultScores}
                  isPremiumMode={isPremiumMode}
                  initialUnlocked={isSharedLink}
                  onStartPremiumTest={handleStartPremiumTest}
                  onRestart={handleRestart}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
