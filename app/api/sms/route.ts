import { NextResponse } from "next/server";
import coolsms from "coolsms-node-sdk";

// 쿨에스엠에스 클라이언트 초기화
const messageService = new coolsms(
  process.env.COOLSMS_API_KEY!,
  process.env.COOLSMS_API_SECRET!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, resultType, resultTitle, resultUrl } = body;

    // 전화번호 하이픈 제거
    const cleanPhone = phone.replace(/-/g, "");

    // 보낼 메시지 내용 구성 (LMS: 장문 문자)
    const messageText = `[꼭고] 진로 분석 결과 도착!

당신신의 진로 유형은:
"${resultTitle}" 입니다.

상위 1% 마이스터고 추천 정보와
숨겨진 합격 전략을 확인하세요.

👉 결과 리포트 보기:
${resultUrl}

*본 문자는 요청에 의해 발송되었습니다.`;

    // 실제 발송 요청
    const response = await messageService.sendOne({
      to: cleanPhone,
      from: process.env.COOLSMS_SENDER_PHONE!, // 발신번호 (사전 등록 필수)
      text: messageText,
      type: "LMS", // 장문 메시지로 명시적 지정 (90바이트 초과)
      autoTypeDetect: false, // 타입을 수동으로 지정하므로 자동 감지 비활성화
    });

    console.log("문자 발송 성공:", response);
    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error("문자 발송 실패:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
