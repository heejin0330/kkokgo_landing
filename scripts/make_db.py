import pandas as pd
import os

# 1. 경로 설정
data_dir = os.path.join('src', 'data')
school_file = os.path.join(data_dir, 'highschoolinfo.csv') #
major_file = os.path.join(data_dir, 'all_major_info_merged.csv') #
output_file = os.path.join(data_dir, 'kkokgo_master_db.csv')

# 2. 파일 로드
try:
    df_school = pd.read_csv(school_file)
    df_major = pd.read_csv(major_file)
    print("파일 로드 완료!")
except FileNotFoundError:
    print(f"오류: {data_dir} 폴더에 파일이 있는지 확인해 주세요.")
    exit()

# 3. 데이터 타입 통일 (매칭 정확도 확보)
df_school['행정표준코드'] = df_school['행정표준코드'].astype(str)
df_major['행정표준코드'] = df_major['행정표준코드'].astype(str)

# 4. 병합 실행 (행정표준코드 + 시도교육청코드 기준)
# 학교 상세 정보와 전체 학과 리스트를 하나로 합칩니다.
merged_df = pd.merge(
    df_major, 
    df_school, 
    on=['행정표준코드', '시도교육청코드'], 
    how='inner', 
    suffixes=('', '_school')
)

# 5. 결과 저장 (엑셀 한글 깨짐 방지)
merged_df.to_csv(output_file, index=False, encoding='utf-8-sig')

print(f"--- 작업 결과 ---")
print(f"생성 파일: {output_file}")
print(f"전체 행 개수: {len(merged_df)}개")

