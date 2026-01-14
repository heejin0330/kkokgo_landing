// ncs_mapping.js (최종본: CSV 파일 읽기 기능 추가)
const fs = require('fs');
const path = require('path');

// 1. NCS 정의 (교육부 2025 표준)
const NCS_Categories = {
    '20': { code: '20', name: '정보통신', badge: '정보통신' },
    '08': { code: '08', name: '문화·예술·디자인·방송', badge: '디자인·콘텐츠' },
    '06': { code: '06', name: '보건·의료', badge: '보건·의료' },
    '15': { code: '15', name: '기계', badge: '기계' },
    '13': { code: '13', name: '음식서비스', badge: '조리·제과' },
    '02': { code: '02', name: '경영·회계·사무', badge: '경영·금융' },
    '18': { code: '18', name: '섬유·의복', badge: '패션·섬유' },
    '19': { code: '19', name: '전기·전자', badge: '전기·전자' },
    '00': { code: '00', name: '기타', badge: '기타' }
};

// 2. NCS 매핑 로직
function assignNCS(schoolName, schoolType) {
    const name = (schoolName || "").trim();
    const type = (schoolType || "").trim();

    if (name.includes('소프트웨어') || name.includes('게임') || name.includes('IT') || name.includes('디지텍') || name.includes('인터넷')) return NCS_Categories['20'];
    if (name.includes('디자인') || name.includes('영상') || name.includes('예술') || name.includes('애니') || name.includes('문화') || name.includes('콘텐츠')) return NCS_Categories['08'];
    if (name.includes('보건') || name.includes('간호') || name.includes('메디') || name.includes('치의')) return NCS_Categories['06'];
    if (name.includes('조리') || name.includes('푸드') || name.includes('외식') || (name.includes('과학') && type.includes('가사'))) return NCS_Categories['13'];
    if (name.includes('기계') || name.includes('공업') || name.includes('마이스터') || name.includes('하이텍')) return NCS_Categories['15'];
    if (name.includes('패션') || name.includes('의류') || name.includes('섬유')) return NCS_Categories['18'];
    if (name.includes('전기') || name.includes('전자') || name.includes('반도체')) return NCS_Categories['19'];
    if (type.includes('상업') || name.includes('경영') || name.includes('세무') || name.includes('금융') || name.includes('비즈니스') || name.includes('물류')) return NCS_Categories['02'];

    return NCS_Categories['00'];
}

// 3. 실행 로직 (CSV 읽기 -> 변환 -> JSON 저장)
try {
    // (1) CSV 파일 읽기
    // * 주의: 파일명이 'original.csv'가 맞는지 꼭 확인하세요!
    const csvPath = path.join(__dirname, 'original.csv'); 
    
    console.log(`📂 데이터 읽는 중... (${csvPath})`);
    const csvData = fs.readFileSync(csvPath, 'utf-8');

    // (2) 줄 단위로 쪼개기
    const rows = csvData.split('\n');
    
    const convertedData = [];

    // (3) 한 줄씩 반복하며 데이터 뽑아내기
    rows.forEach((row, index) => {
        if (!row.trim()) return; // 빈 줄 건너뛰기

        // 콤마(,)로 분리 (따옴표 처리가 복잡하면 csv-parser 라이브러리 써야 하지만, 일단 기본 split 사용)
        const cols = row.split(',');

        // * 데이터 위치 매핑 (아까 보여주신 순서 기준)
        // 1번째: 학교명 (인덱스 1)
        // 3번째: 계열 (인덱스 3 - 공업, 상업 등)
        // 15번째: 주소 (인덱스 15)
        // 13번째: 홈페이지 (인덱스 13)
        const schoolName = cols[1]; 
        const schoolType = cols[3];
        const address = cols[15];
        const homepage = cols[13];

        if (schoolName && schoolName !== '학교명') { // 헤더(제목) 줄 제외
            const ncsInfo = assignNCS(schoolName, schoolType);
            
            convertedData.push({
                id: index,
                school_name: schoolName ? schoolName.trim() : "",
                type: schoolType ? schoolType.trim() : "",
                address: address ? address.trim() : "",
                homepage: homepage ? homepage.trim() : "",
                // 🔥 NCS 데이터 추가
                ncs_code: ncsInfo.code,
                ncs_name: ncsInfo.name,
                ncs_badge_label: ncsInfo.badge
            });
        }
    });

    // (4) 저장할 경로 및 파일 쓰기
    const outputDir = path.join(__dirname, 'src', 'data');
    const outputFile = path.join(outputDir, 'schools.json');

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(outputFile, JSON.stringify(convertedData, null, 2), 'utf-8');

    console.log(`✅ 성공! 총 ${convertedData.length}개의 학교 데이터를 변환하여 저장했습니다.`);
    console.log(`   저장 위치: ${outputFile}`);

} catch (error) {
    console.error("❌ 에러 발생:", error.message);
    console.log("힌트: 'original.csv' 파일이 같은 폴더에 있는지 확인해주세요.");
}

