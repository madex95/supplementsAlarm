



// 현재 년-월-일 시:분:초 구하기 함수
export const getDate = (): string => {
  
  const now = new Date();

  // UTC 기준 한국시간 설정
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + kstOffset);

  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');

  const hours = String(kstDate.getHours()).padStart(2, '0');
  const minutes = String(kstDate.getMinutes()).padStart(2, '0');
  const seconds = String(kstDate.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};



// 년월일만 추출하는 함수  (예: 2026-09-17 11:11:11 -> 20260917)
export const getYMD = (dateInput?: string | Date): string => {
  if (!dateInput) return '';

  let dateString: string;

  // Date 객체가 들어오면 YYYY-MM-DD 형태의 문자열로 변환
  if (dateInput instanceof Date) {
    // 유효하지 않은 Date 객체(Invalid Date) 체크
    if (isNaN(dateInput.getTime())) return '';
    
    const y = dateInput.getFullYear();
    const m = String(dateInput.getMonth() + 1).padStart(2, '0');
    const d = String(dateInput.getDate()).padStart(2, '0');
    dateString = `${y}-${m}-${d}`;
  } else {
    dateString = dateInput;
  }

  const regex = /(\d{4})[-/.](\d{2})[-/.](\d{2})/;
  const match = dateString.match(regex);

  if (match) {
    return `${match[1]}${match[2]}${match[3]}`;
  }

  //  YYYYMMDD 형태인 경우 그대로
  if (/^\d{8}$/.test(dateString)) {
    return dateString;
  }

  return '';
};



// getYMD로 리턴받은 날짜를 넣으면 현재랑 비교해서 과거인지 오늘인지 미래인지 구별하는 함수
// 각각 P/T/F 리턴
export const getDatePoint = (date : string) : string => {

  const now = getYMD(getDate());

  // 미래
  if (now < date) {
    return 'F';
  } 
  // 오늘
  else if (now === date) {
    return 'T';
  } 
  // 과거
  else {
    return 'P';
  }

}