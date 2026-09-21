import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import 'react-native-get-random-values';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import * as c from '../../utillTs/commonUtill';
import * as DB from '../../utillTs/tableUtill';


// 피커 항목 1개의 높이 설정
const ITEM_HEIGHT = 50; 

// 복용 횟수 배열 설정
const takeFreqArray = [1, 2, 3, 4, 5];

// 데이터 반복 횟수 설정
const repeatCnt = 5;

// 복용 횟수 루프 설정
const takeFreqLoop = Array.from({ length: repeatCnt }, () => takeFreqArray).flat();

// 복용 시간의 '시' 루프 설정
const hourData = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const hourLoop = Array.from({ length: 3 }, () => hourData).flat();

// 복용 시간의 '분' 루프 설정
const minData = ['00', '10', '20', '30', '40', '50'];
const minLoop = Array.from({ length: 10 }, () => minData).flat();



export default function pillScreen(){
  // 로컬 데이터가 저장될 state
  const [localTablePill, setLocalTablePill] = useState<DB.PILL[]>([]);
  const [localTablePillDetail, setLocalTablePillDetail] = useState<DB.PILL_DETAIL[]>([]);
  const [localTablePillTakeLog, setLocalTablePillTakeLog] = useState<DB.PILL_TAKE_LOG[]>([]);
  
  useFocusEffect(
    useCallback(() => {
      const loadStoredData = async () => {
        try {
          const storedPill = await AsyncStorage.getItem(DB.PILL_KEY);
          const storedPillDetail = await AsyncStorage.getItem(DB.PILL_DETAIL_KEY);
          const storedPillTakeLog = await AsyncStorage.getItem(DB.PILL_TAKE_LOG_KEY);

          const mstData: DB.PILL[] = storedPill ? JSON.parse(storedPill) : [];
          const dtlData: DB.PILL_DETAIL[] = storedPillDetail ? JSON.parse(storedPillDetail) : [];
          const logData: DB.PILL_TAKE_LOG[] = storedPillTakeLog ? JSON.parse(storedPillTakeLog) : [];

          const validMstData = mstData.filter((item) => item.DEL_YN === 'N');
          const validDtlData = dtlData.filter((item) => item.DEL_YN === 'N');
          const validLoglData = logData.filter((item) => item.DEL_YN === 'N');

          setLocalTablePill(validMstData.sort((a,b) => (b.REG_DT).localeCompare(a.REG_DT)));
          setLocalTablePillDetail(validDtlData);
          setLocalTablePillTakeLog(validLoglData);

        } catch (e) {
          console.error('데이터 불러오기 실패:', e);
        }
      };

      loadStoredData();
    }, []) 
  );


  // 등록/수정 구분 state
  const [mode, setMode] = useState<String>();

  // 회차별 시간 state
  const [pillTakeTimeArray, setPillTakeTimeArray] = useState<string[]>(['10:00']);

  //const [updateData , setUpdateData] = useState<PILL_DETAIL[]>([]);

  // 임시로 사용될 state
  const [tempDataState , setTempDataState] = useState<{[key: string]: any;}>();

  // 알림 모달 visible state
  const [alertModalVisible, setAlertModalVisible] = useState(false);

  // 알림 모달 메시지 State
  const [alertModalMessage, setAlertModalMessage] = useState('');






  

  // ↓↓↓↓↓ 약 등록 모달 부분 ↓↓↓↓↓ 약 등록 모달 부분 ↓↓↓↓↓
  // ↓↓↓↓↓ 약 등록 모달 부분 ↓↓↓↓↓ 약 등록 모달 부분 ↓↓↓↓↓

  // 약 등록 모달 visible state
  const [pillRegModalVisible, setPillRegModalVisible] = useState(false);

  // 약 이름 state
  const [pillRegName, setPillRegName] = useState('');

  // 약 등록 복용 횟수 state
  const [pillRegTakeFreq, setPillRegTakeFreq] = useState(1);   

  // 복용 횟수 버튼 클릭 시 실행 함수
  const takeFreqBtnClk = () => {
    //take Frequency button Click
    console.log("복용 횟수 버튼 클릭");

    setTakeFreq(Number(pillRegTakeFreq));// 복용 횟수 모달에서의 복용 횟수 세팅

    // 약 복용 횟수 모달 열기
    setPillTakeFreqModalVisible(true);
  };

  // 복용 회차별 시간 클릭 시 실행 함수
  const takeTurnTmClk = (index:number) => {
    // take Turn Time Click
    console.log("복용 회차 시간 클릭 " + index);
    
    // 현재 선택한 row 인덱스 설정
    setSelectedRowIndex(index);

    // 해당 인덱스의 시간 값 설정
    const currentTime = pillTakeTimeArray[index] || `${((18 + index) % 24).toString().padStart(2, '0')}:00`;

    // 시간,분 분리
    const [h,m] = currentTime.split(':'); 
    
    // 시 피커 값 설정
    setTakeHour(h);
    
    // 분 피커 값 할당
    setTakeMin(m); 

    // 복용 시간 모달 열기
    setTakeTimeModalVisible(true);
  }
  
  // 약 등록 확인 버튼 클릭 시 실행 함수 (등록과 수정 둘 다 사용)
  const pillRegConfirmBtnClick = async () => {
    // pill regist confirm button click
    console.log("약 등록 확인 버튼 클릭");

    console.log(mode);


    if(mode === 'U'){

      // 업데이트 데이터의 uuid
      const updateUuid = tempDataState?.P_UUID;

      // UUID에 맞는 마스터 데이터 
      const pillData = localTablePill.find((item) => item.P_UUID === updateUuid && item.DEL_YN === 'N');
      
      // uuid에 해당하는 디테일 데이터
      const pillDetailData = localTablePillDetail.filter((item) => item.P_UUID === updateUuid && item.DEL_YN === 'N');

      // uuid를 제외하고 남은 디테일 데이터
      const extPillDetailData = localTablePillDetail.filter((item) => item.P_UUID !== updateUuid && item.DEL_YN === 'N');

      // uuid에 해당하는 로그 데이터
      const pillTakeLogData = localTablePillTakeLog.find((item) => item.P_UUID === updateUuid && item.DEL_YN === 'N');


      // =========================================================================
      // 🟢 [추가 1] 복용 스케줄(횟수/시간)이 실제로 변경되었는지 확인
      // =========================================================================
      const useDetails = pillDetailData.filter((item) => item.USE_YN === 'Y');
      const takeFreqChk = Number(pillData?.P_D_TK_FREQ) !== Number(takeFreq);
      const takeTimeChk = 
        useDetails.length !== pillTakeTimeArray.length ||
        useDetails.some((dtl, idx) => dtl.P_TK_TM !== pillTakeTimeArray[idx]);

      const changeChk = takeFreqChk || takeTimeChk;

      if (!changeChk) {
        const masterUpdateData = localTablePill.map((item) => {
          if (item.P_UUID === updateUuid) {
            return {
              ...item, 
              P_NM: pillRegName,
              MOD_DT : c.getDate()
            };
          }
          return item; 
        });

        try {
          await AsyncStorage.setItem(DB.PILL_KEY, JSON.stringify(masterUpdateData));
          setLocalTablePill(masterUpdateData.sort((a,b) => (b.REG_DT).localeCompare(a.REG_DT)));
        } catch (e) {
          console.log("실패 " , e);
        }

        pillRegCls();
        return; 
      } 


      // 마스터 업데이트 데이터 세팅
      const masterUpdateData = localTablePill.map((item) => {
        if (item.P_UUID === updateUuid) {
          return {
            ...item, 
            P_D_TK_FREQ: takeFreq,
            P_NM: pillRegName,            
            MOD_DT: c.getDate(),            
          };
        }
        return item; 
      }); 

      // 디테일 객체 생성
      let detailUpdateData: DB.PILL_DETAIL[] = [];

      console.log('pillTakeLogData ' , pillTakeLogData);

      // 디테일 업데이트 데이터 세팅
        detailUpdateData = pillDetailData.map((item) => {

          // 업데이트 시간
          const newTime = pillTakeTimeArray[item.P_TK_TN - 1] || item.P_TK_TM;

          // 기존-업데이트 데이터간 복용 시간 변화 체크 -> 시간이 같으면 false
          const isTimeChanged = item.P_TK_TM !== newTime;
          
          // USE_YN 체크 -> y일 시 false
          const isUseYnY = item.USE_YN !== 'Y';

          // 변화가 있는지 체크 -> 하나라도 true 있으면 true 
          const isUpdatedToY = isTimeChanged || isUseYnY;


          // 업데이트 복용 횟수까지 
          if (item.P_TK_TN <= takeFreq) {

            return {
              ...item,
              P_TK_TM: newTime,
              USE_YN: 'Y',
              // 변경사항이 있을 시 수정시간 변경
              MOD_DT: isUpdatedToY ? c.getDate() : item.MOD_DT,
            };
          }

          // USE_YN 체크 n일 시 false
          const isUseYnN = item.USE_YN !== 'N';

          // 복용 횟수가 기존보다 감소하여 남은 deteil 데이터
          return {
              ...item,
              P_NM: pillRegName,
              USE_YN: 'N',
              MOD_DT: isUseYnN ? c.getDate() : item.MOD_DT,
          }
        });

        // db에 저장되어 있는 row 갯수
        const maxRowCount = pillDetailData.length;

        // 복용횟수가 USE_YN이 N인 값을 포함한 detail 데이터 갯수보다 증가한 경우
        // 예시) 최초에 1개 저장, 그 후 3개로 수정 (2개를 새로 추가해야됨)
        if (takeFreq > maxRowCount) {
          for (let i = maxRowCount + 1; i <= takeFreq; i++) {
            detailUpdateData.push({
              P_UUID: updateUuid,
              P_TK_TN: i,
              P_TK_TM: pillTakeTimeArray[i - 1] || `${((18 + i) % 24).toString().padStart(2, '0')}:00`,
              USE_YN: 'Y',
              DEL_YN: 'N',
              REG_DT: c.getDate(),
              MOD_DT: c.getDate(),
              DEL_DT : null
            });
          }
        }
        
        const detailAllData = [...extPillDetailData, ...detailUpdateData];



        try {
          // 마스터-디테일 로컬 저장
          await AsyncStorage.setItem(DB.PILL_DETAIL_KEY, JSON.stringify(detailAllData));
          await AsyncStorage.setItem(DB.PILL_KEY, JSON.stringify(masterUpdateData));

          // state 반영
          setLocalTablePill(masterUpdateData.sort((a,b) => (b.REG_DT).localeCompare(a.REG_DT)));
          setLocalTablePillDetail(detailAllData);
        } catch (e){
          console.log("에러 발생 " , e)
        }

        const todayYMD = c.getYMD(c.getDate());
        
        // 등록한 날과 수정하는 날(오늘)이 다를 때 (로그 테이블 등록해야됨)
        if (c.getYMD(tempDataState?.REG_DT) !== c.getYMD(c.getDate())){
          // 로그 -> 수정하는 날(오늘)의 전날까지 등록

          // 등록 날짜
          let regDate = new Date(pillData!.REG_DT);

          //let modDate = new Date(tempDataState?.MOD_DT);

          const logDateArray = [];

          // 등록날짜부터 수정날짜까지 순회
          while(c.getYMD(regDate) < todayYMD){

            const regDateYMD = c.getYMD(regDate);

            // 로그 테이블에 해당 날짜의 데이터 있는지 체크 (있으면 true)
            const skipChk = localTablePillTakeLog.some(
              (item) => {
                return(
                  item.P_UUID === updateUuid &&
                  item.DEL_YN === 'N' &&
                  c.getYMD(item.P_TK_DT) === regDateYMD )
              }
            );

            // 해당 날짜의 데이터가 있으면 true
            if (!skipChk) {
              const yyyy = regDate.getFullYear();
              const mm = String(regDate.getMonth() + 1).padStart(2, '0');
              const dd = String(regDate.getDate()).padStart(2, '0');
              
              logDateArray.push(`${yyyy}-${mm}-${dd}`);
            }

            regDate.setDate(regDate.getDate() + 1);
          }

          const validDetailData = localTablePillDetail.filter(
            (dtl) => dtl.P_UUID === updateUuid && 
                     dtl.USE_YN === 'Y' && 
                     dtl.DEL_YN === 'N'
          );

          let copyLogData = [...localTablePillTakeLog];

          logDateArray.forEach((log) => {
            validDetailData.forEach((dtl) => {
              copyLogData.push({
                P_UUID: dtl.P_UUID,
                P_TK_TN: dtl.P_TK_TN,
                P_TK_DT: log,             
                P_TK_TM: dtl.P_TK_TM,
                P_TK_CHK_YN: 'N',                
                USE_YN: 'Y',
                DEL_YN: 'N',
                REG_DT: c.getDate(),             
                MOD_DT: c.getDate(),
                DEL_DT: null,
              })
            })
          })
 
          try{

            // 로그 sate 세팅
            setLocalTablePillTakeLog(copyLogData);

            // 로컬 로그 테이블 저장
            await AsyncStorage.setItem(DB.PILL_TAKE_LOG_KEY, JSON.stringify(copyLogData));

          } catch (e) {
            console.log(e);
          }
        }
        // 같은 날인데 로그 테이블에 값이 존재 할 때 
        else {
          if (pillTakeLogData){

            console.log('들어왓슴디ㅏ닫다다다다다');

            let copyLogData = [...localTablePillTakeLog];
            const cnt = new Set<number>();

            console.log('디테일 업데이트 데이트 ');
            console.log(detailUpdateData);

            copyLogData = copyLogData.map((log) => {
              if (log.P_UUID === updateUuid && log.DEL_YN === 'N' && c.getYMD(log.P_TK_DT) === todayYMD){
                
                const collectTurn = takeFreq >= log.P_TK_TN;

                if (collectTurn){
                  console.log('맞음!!!!!!!')
                   const dtlObj = detailUpdateData.find((dtl) => dtl.P_TK_TN === log.P_TK_TN);

                   cnt.add(log.P_TK_TN)

                   return {
                    ...log,
                    P_TK_TM : dtlObj!.P_TK_TM,
                    P_TK_CHK_YN : 'N',
                    USE_YN : 'Y',
                    MOD_DT : c.getDate()
                   };
                } else {
                  console.log('다름!!!!!!!')
                  return {
                    ...log,
                    P_TK_CHK_YN: 'N',
                    USE_YN: 'N',
                    MOD_DT: c.getDate(),
                  }
                }

              }
              return log;
            })

            console.log('업데이트 복용횟수 ' , takeFreq);
            console.log('디테일 업데이트 데이터 ' , detailUpdateData);

            detailUpdateData.forEach((item) => {
              // 복용횟수 늘어나서 남은 회차들
              if (takeFreq >= item.P_TK_TN && !cnt.has(item.P_TK_TN)){

                cnt.add(item.P_TK_TN);
                console.log('남은 회차!! ' , item.P_TK_TN)
                copyLogData.push({
                      P_UUID: item.P_UUID,
                      P_TK_TN: item.P_TK_TN,
                      P_TK_DT: c.getDate().slice(0, 10),
                      P_TK_TM: item.P_TK_TM,
                      P_TK_CHK_YN: 'N',
                      USE_YN: 'Y',
                      DEL_YN: 'N',
                      REG_DT: c.getDate(),
                      MOD_DT: c.getDate(),
                      DEL_DT: null,
                    });
              }
            })



            try{

  console.log('==== [PILL_TAKE_LOG 테이블 데이터 : ' , copyLogData.length , '건] ====');
    for (let i=0; i<copyLogData.length; i++){
      console.log(copyLogData[i]);
    }

              // 로그 sate 세팅
              setLocalTablePillTakeLog(copyLogData);

              // 로컬 로그 테이블 저장
              await AsyncStorage.setItem(DB.PILL_TAKE_LOG_KEY, JSON.stringify(copyLogData));
            } catch (e) {
              console.log(e);
            }
          }
        }
      pillRegCls();
    }
    // 약 등록일 경우 (C)
    else if (mode === 'C'){
      console.log("약 등록 실행");
      let newUuid = uuidv4();

      const storedPill = await AsyncStorage.getItem(DB.PILL_KEY);

      const mstData: DB.PILL[] = storedPill ? JSON.parse(storedPill) : [];

      // uuid 중복 검사
      while (mstData.some((item) => item.P_UUID === newUuid)){
        newUuid = uuidv4();
      }

      // PILL 테이블 설정
      const newTablePill: DB.PILL = {
        P_UUID: newUuid,
        P_NM: pillRegName,
        P_D_TK_FREQ: pillRegTakeFreq,
        DEL_YN:'N',
        //REG_DT: '2026-09-18',
        REG_DT : c.getDate(),
        MOD_DT : c.getDate(),
        DEL_DT : null
      };

      // PILL_DETIAL 테이블 설정 (takeCount 개수만큼 N개)
      const newTablePillDetail: DB.PILL_DETAIL[] = Array.from({ length: pillRegTakeFreq }).map((_, index) => {
        const time = pillTakeTimeArray[index] || `${((18 + index) % 24).toString().padStart(2, '0')}:00`;
        return {
          P_UUID: newUuid,
          P_NM: pillRegName,
          P_TK_TN: index + 1, 
          P_TK_TM: time,
          USE_YN: 'Y',
          DEL_YN: 'N',
          //REG_DT: '2026-09-18',
          REG_DT: c.getDate(),
          MOD_DT: c.getDate(),
          DEL_DT : null
        };
      });

      const mstRegData = [...localTablePill, newTablePill];
      const dtlRegData = [...localTablePillDetail, ...newTablePillDetail];

      mstRegData.sort((a,b) => (b.REG_DT).localeCompare(a.REG_DT));

      try {
        // 로컬 저장소에 저장
        await AsyncStorage.setItem(DB.PILL_KEY, JSON.stringify(mstRegData));
        await AsyncStorage.setItem(DB.PILL_DETAIL_KEY, JSON.stringify(dtlRegData));

        setLocalTablePill(mstRegData.sort((a,b) => (b.REG_DT).localeCompare(a.REG_DT)));
        setLocalTablePillDetail(dtlRegData);

        pillRegCls(); 

      } catch (e) {
        console.error('저장 실패:', e);
      }
    } 
  };

  // 확인 버튼 활성화
  const regNameChk = () => {

    if (!pillRegName.trim()) {
        return true; // disabled = true
    }

    // 수정 모드 일 경우
    if (mode === 'U') {
      // 약 이름 변경 확인
      const isNameUnchanged = tempDataState?.P_NM === pillRegName;
      
      // 복용 횟수 변경 확인
      const isFreqUnchanged = pillRegTakeFreq === Number(tempDataState?.P_D_TK_FREQ ?? 0);

      // 복용 시간 변경 확인
      const isTimeUnchanged = 
        Array.isArray(tempDataState?.P_TK_TM) &&
        tempDataState.P_TK_TM.length === pillTakeTimeArray.length &&
        tempDataState.P_TK_TM.every((time: string, index: number) => time === pillTakeTimeArray[index]);

      // 세가지가 모두 변경되지 않았을 때 버튼 비활성화
      if (isNameUnchanged && isFreqUnchanged && isTimeUnchanged) {
        return true; // disabled = true
      }
    }

    return false; // disabled = false
  }

  // 약 등록 모달 닫힐 시 실행 함수
  const pillRegCls = () => {
    setPillRegName('');  // 약 등록 이름 초기화
    setPillRegTakeFreq(1);  // 약 등록 복용 횟수 초기화
    setPillTakeTimeArray(['10:00']); // 약 복용 시간 초기화
    setPillRegModalVisible(false); // 약 등록 모달 닫기
  }

  // ↑↑↑↑↑ 약 등록 모달 부분 ↑↑↑↑↑ 약 등록 모달 부분 ↑↑↑↑↑
  // ↑↑↑↑↑ 약 등록 모달 부분 ↑↑↑↑↑ 약 등록 모달 부분 ↑↑↑↑↑

 

  // ↓↓↓↓↓ 복용 횟수 모달 부분 ↓↓↓↓↓ 복용 횟수 모달 부분 ↓↓↓↓↓
  // ↓↓↓↓↓ 복용 횟수 모달 부분 ↓↓↓↓↓ 복용 횟수 모달 부분 ↓↓↓↓↓

  // 복용 횟수 state
  const [takeFreq, setTakeFreq] = useState(1);  

  // 약 복용 횟수 모달 visible state
  const [pillTakeFreqModalVisible, setPillTakeFreqModalVisible] = useState(false); 

  // 약 복용 횟수 피커 ref
  const pillTakeFreqRef = useRef<FlatList>(null);

  // 복용 횟수 피커 핸들러
  const takeFreqPickerHandler = (event: any) => {
    // 수직 스크롤 위치 추출 (피커마다 선언 권장)
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // 현재 피커 중앙에 위치한 항목의 인덱스 값 구하기
    const index = Math.round(offsetY / ITEM_HEIGHT);

    // 해당 인덱스 값에 해당하는 복용횟수
    const selectedValue = takeFreqLoop[index];

    // selectedValue가 존재하고 selectedValue가 복용 횟수와 다르면 true
    if (selectedValue && selectedValue !== takeFreq) {
      // 복용 횟수 설정
      setTakeFreq(Number(selectedValue));
    }

    // 세트 수 지정
    const setSize = takeFreqArray.length; 

    // 사용자가 스크롤을 위로 많이 올려 첫번째 세트 영역 도달 체크
    if (index < setSize) {
      // 중앙 세트의 동일 값으로 이동
      setTimeout(() => {
        pillTakeFreqRef.current?.scrollToIndex({ index: index + setSize, animated: false });
      }, 10);
    } 
    // 사양자가 스크롤을 아래로 많이 내려 세번째 세트 영역 도달 체크
    else if (index >= setSize * 2) {
      // 중앙 세트의 동일 값으로 이동
      setTimeout(() => {
        pillTakeFreqRef.current?.scrollToIndex({ index: index - setSize, animated: false });
      }, 10);
    }
  };

  // 복용 횟수 바텀시트의 확인 버튼 클릭 함수
  const takeFreqCfmBtnClk = () => {
    //  take Freaquency Confirm button Click
    console.log("복용 횟수 확인 버튼 클릭")

    // 복용횟수 세팅
    setPillRegTakeFreq(takeFreq);

    // 현재 설정되어 있는 시간 배열 복사
    const updatedTimes = [...pillTakeTimeArray];

    // 새로 선택한 복용 횟수(takeFreq)가 시간 배열(updatedTimes) 길이보다 크다면(복용 횟수 증가한 경우)
    if (takeFreq > updatedTimes.length) {
      
      // 현재 배열의 마지막 시간 가져오기
      const lastTime = updatedTimes[updatedTimes.length - 1];

      // 마지막 시간의 시 추출
      const lastHour = parseInt(lastTime.slice(0,2), 10);

      // 증가된 복용 횟수
      const addedTakeFreq = takeFreq - updatedTimes.length;

      // 증가된 복용 횟수 만큼 시 기준으로 +2시간씩 추가
      for (let i = 1; i <= addedTakeFreq; i++) {
        const nextHour = (lastHour + i * 2) % 24;
        updatedTimes.push(`${nextHour.toString().padStart(2, '0')}:00`);
      }
    } 
    // 새로 선택한 복용 횟수(takeFreq)가 시간 배열(updatedTimes) 길이보다 작다면(복용 횟수 감소한 경우)
    else if (takeFreq < updatedTimes.length) {
      // takeFreq번 째 인덱스 값을 포함하고 그 이후 값들 slice
      updatedTimes.splice(takeFreq);
    }

    // 변경된 시간 반영
    setPillTakeTimeArray(updatedTimes);

    // 약 복용 횟수 모달 닫기
    setPillTakeFreqModalVisible(false);
  };

  // ↑↑↑↑↑ 복용 횟수 모달 부분 ↑↑↑↑↑ 복용 횟수 모달 부분 ↑↑↑↑↑
  // ↑↑↑↑↑ 복용 횟수 모달 부분 ↑↑↑↑↑ 복용 횟수 모달 부분 ↑↑↑↑↑



  // ↓↓↓↓↓ 복용 회차별 시간 모달 부분 ↓↓↓↓↓ 복용 회차별 시간 모달 부분 ↓↓↓↓↓
  // ↓↓↓↓↓ 복용 회차별 시간 모달 부분 ↓↓↓↓↓ 복용 회차별 시간 모달 부분 ↓↓↓↓↓

  // 복용 시간 모달 visible state
  const [takeTimeModalVisible, setTakeTimeModalVisible] = useState(false); 
  
  // 선택한 row 인덱스 state
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0); 

  // 복용 시간 '시' state
  const [takeHour, setTakeHour] = useState<string>('01');

  // 복용 시간 '시' 피커 ref
  const takeHourPickerRef = useRef<FlatList>(null);

  // 복용 시간 '분' state
  const [takeMin, setTakeMin] = useState('00');
  
  // 복용 시간 '분' 피커 ref
  const takeMinPickerRef = useRef<FlatList>(null);

  // 복용 시간의 '시' 피커 핸들러
  const takeTimeHourPickerHandler = (event: any) => {
    // take Time Hour Picker Stop
    //console.log("복용 시간 '시' 피커 멈춤");

    // 수직 스크롤 위치 추출 (피커마다 선언 권장)
    const offsetY = event.nativeEvent.contentOffset.y;

    // 현재 피커 중앙에 위치한 항목의 인덱스 값 구하기
    const targetIndex = Math.round(offsetY / ITEM_HEIGHT);
    
    // 선택된 시 설정
    const selectedHour = hourLoop[targetIndex];

    // selectedHour의 값이 존재하고 그 값이 기존 섭취 시와 다르면 true
    if (selectedHour && selectedHour !== takeHour) {
      // 복용 시간 설정
      setTakeHour(selectedHour);
    }

    // 한 세트 기준 사이즈 설정
    const setSize = hourData.length; 
    
    // 첫 번째 세트(상단 끝) 또는 마지막 세트(하단 끝)에 도달했을 때 true
    if (targetIndex < setSize || targetIndex >= setSize * 2) {

      // 실제 인덱스
      const realIndex = targetIndex % setSize;

      // 스크롤 이벤트 끝난 후 10ms 이후 setTimeout 실행
      setTimeout(() => {
        // takeHourPickerRef로 연결된 피커의 스크롤 강제 이동
        takeHourPickerRef.current?.scrollToIndex({
          // 중앙 세트(인덱스 48~71) 위치로 순간이동
          index: setSize * 1 + realIndex, 
          // 애니메이션 효과 없앰
          animated: false,
        });
      }, 10);
    }
  };

  // 복용 시간의 '분' 피커 핸들러
  const takeTimeMinPickerHandler = (event: any) => {

    // 수직 스크롤 위치 추출 (피커마다 선언 권장)
    const offsetY = event.nativeEvent.contentOffset.y;

    // 현재 피커 중앙에 위치한 항목의 인덱스 값 구하기
    const targetIndex = Math.round(offsetY / ITEM_HEIGHT);
    
    // 선택된 분 설정
    const selectedMin = minLoop[targetIndex];

    // selectedMin의 값이 존재하고 그 값이 기존 섭취 분과 다르면 true
    if (selectedMin && selectedMin !== takeMin) {
      // 복용 분 설정
      setTakeMin(selectedMin);
    }

    // 한 세트 기준 사이즈 설정
    const setSize = minData.length; 

    // // 첫 번째 세트(상단 끝) 또는 마지막 세트(하단 끝)에 도달했을 때 true
    if (targetIndex < setSize || targetIndex >= setSize * 9) {

      // 실제 인덱스
      const realIndex = targetIndex % setSize;

      // 스크롤 이벤트 끝난 후 10ms 이후 setTimeout 실행
      setTimeout(() => {
        // takeMinPickerRef로 연결된 피커의 스크롤 강제 이동
        takeMinPickerRef.current?.scrollToIndex({
          // 중앙 세트 (인덱스 12~17) 위치로 이동
          index: setSize * 5 + realIndex, 
          // 애니메이션 효과 없앰
          animated: false,
        });
      }, 10);
    }
  };

  // 복용 회차별 시간 모달의 확인 버튼 클릭시 실행 함수
  const takeTurnTmCfmBtnClk = () => {
    // take Turn Time Cofirm button Click
    console.log("복용 회차 시간 확인 버튼 클릭");

    // 기존 약 복용 시간 배열 복사
    const updatedTimes = [...pillTakeTimeArray];

    // 복용 중복 시간 체크
    if (updatedTimes.some((item) => item === `${takeHour}:${takeMin}`)){
      openAlertModal('같은 복용시간이 존재합니다.');
      return;
    }

    // 현재 선택된 행 시간을 피커에서 선택한 시간으로 설정
    updatedTimes[selectedRowIndex] = `${takeHour}:${takeMin}`;

    // 빠른 시간 순(오름차순)으로 배열 정렬
    updatedTimes.sort((a, b) => a.localeCompare(b));

    // 정렬된 배열로 시간 설정
    setPillTakeTimeArray(updatedTimes);

    // 복용 시간 모달 닫기
    setTakeTimeModalVisible(false);

  };
  
  // ↑↑↑↑↑ 복용 회차별 시간 모달 부분 ↑↑↑↑↑ 복용 회차별 시간 모달 부분 ↑↑↑↑↑
  // ↑↑↑↑↑ 복용 회차별 시간 모달 부분 ↑↑↑↑↑ 복용 회차별 시간 모달 부분 ↑↑↑↑↑



  // ↓↓↓↓↓ 알림 모달 부분 ↓↓↓↓↓ 알림 모달 부분 ↓↓↓↓↓ 알림 모달 부분 ↓↓↓↓↓
  // ↓↓↓↓↓ 알림 모달 부분 ↓↓↓↓↓ 알림 모달 부분 ↓↓↓↓↓ 알림 모달 부분 ↓↓↓↓↓


const alertResolverRef = useRef<((value?: unknown) => void) | null>(null);

// 🟢 openAlertModal: Promise 내부에서 resolve 등록 후 state 변경
const openAlertModal = (message: string) => {
  return new Promise((resolve) => {
    alertResolverRef.current = resolve;

    setAlertModalMessage(message);
    setAlertModalVisible(true);
  });
};

const alertModalHandler = () => {
  setAlertModalVisible(false);

  if (alertResolverRef.current) {
    const resolve = alertResolverRef.current;
    alertResolverRef.current = null; 
    resolve(true); 
  }
};




  // ↑↑↑↑↑ 알림 모달 부분 ↑↑↑↑↑ 알림 모달 부분 ↑↑↑↑↑ 알림 모달 부분 ↑↑↑↑↑
  // ↑↑↑↑↑ 알림 모달 부분 ↑↑↑↑↑ 알림 모달 부분 ↑↑↑↑↑ 알림 모달 부분 ↑↑↑↑↑
  



//테스트영역 테스트영역 테스트영역 
//테스트영역 테스트영역 테스트영역 
//테스트영역 테스트영역 테스트영역 
// 테스트영역 테스트영역 테스트영역 


  const testReset = async() => {
    try {
        // 1. AsyncStorage에 저장된 특정 키의 데이터 삭제
        await AsyncStorage.removeItem(DB.PILL_KEY);
        await AsyncStorage.removeItem(DB.PILL_DETAIL_KEY);
        await AsyncStorage.removeItem(DB.PILL_TAKE_LOG_KEY);

        // 2. 화면에 연결된 React State도 빈 배열로 초기화 (UI 즉시 반영)
        setLocalTablePill([]);
        setLocalTablePillDetail([]);
        setLocalTablePillTakeLog([]);

        console.log('전체 테이블 데이터가 초기화되었습니다.');
      } catch (e) {
        console.error('초기화 실패:', e);
      }
  }

  //const [updateData , setUpdateData] = useState<PILL_DETAIL[]>([]);

  const testUpdateBtnClick = async (item : DB.PILL) => {

    

    // 디테일 불러오기
    const tempDetail = localTablePillDetail.filter(
      (tableData) => tableData.P_UUID === item.P_UUID && tableData.USE_YN ==='Y'
    ) 

    // 시간 세팅
    const timeArray = tempDetail.map((data) => data.P_TK_TM);

console.log('모달 뜨기 전 ' , c.getDate().slice(-8));
await openAlertModal('복용횟수/시간 변경시 \n 오늘 기록된 복용 체크는 \n 모두 취소됩니다.');
    setTempDataState({
      P_UUID: item.P_UUID,
      P_D_TK_FREQ: item.P_D_TK_FREQ,
      P_NM: item.P_NM,
      P_TK_TM: timeArray,
      REG_DT: item.REG_DT,
      MOD_DT: item.MOD_DT,
    });

    setPillRegName(item.P_NM);
    setPillRegTakeFreq(item.P_D_TK_FREQ);
    setPillTakeTimeArray(timeArray);

    // 수정 폼 모달 열기
    setPillRegModalVisible(true);
// openAlertModal(
//   '복용횟수/시간 변경시 오늘 기록된 복용 체크는 모두 취소됩니다.',
//   () => {

//     console.log('드디어 모달 떴다!!!');
    
//     setTempDataState({
//       P_UUID: item.P_UUID,
//       P_D_TK_FREQ: item.P_D_TK_FREQ,
//       P_NM: item.P_NM,
//       P_TK_TM: timeArray,
//       REG_DT: item.REG_DT,
//       MOD_DT: item.MOD_DT,
//     });

//     setPillRegName(item.P_NM);
//     setPillRegTakeFreq(item.P_D_TK_FREQ);
//     setPillTakeTimeArray(timeArray);

//     // 수정 폼 모달 열기
//     setPillRegModalVisible(true);
//   }
// );
          

      // const pillData = await AsyncStorage.getItem(PILL_KEY);
      
      // if (pillData) {
      //   const pillTable : PILL[] = JSON.parse(pillData);
      //   for(let i=0; i<pillTable.length; i++){
      //     console.log(pillTable[i].P_UUID);
      //   }
      // }

  }

  const test = async () => {

    const mst = await AsyncStorage.getItem(DB.PILL_KEY);
    const dtl = await AsyncStorage.getItem(DB.PILL_DETAIL_KEY);
    const log = await AsyncStorage.getItem(DB.PILL_TAKE_LOG_KEY);

    const pmst =  mst ? JSON.parse(mst) : [];
    const pdtl =  dtl ? JSON.parse(dtl) : [];
    const plog =  log ? JSON.parse(log) : [];


    console.log('==== [PILL 테이블 데이터 : ' , pmst.length , '건] ====');
    for (let i=0; i<pmst.length; i++){
      console.log(pmst[i]);
    }

    console.log('==== [PILL_DETAIL 테이블 데이터 : ' , pdtl.length , '건] ====');
    for (let i=0; i<pdtl.length; i++){
      console.log(pdtl[i]);
    }

    console.log('==== [PILL_TAKE_LOG 테이블 데이터 : ' , plog.length , '건] ====');
    for (let i=0; i<plog.length; i++){
      console.log(plog[i]);
    }

  }


const addTest = async () => {
  try {
    const targetUuid = '44a8faa6-5eda-47e9-b611-544314e00bc9';

    // 1. 기존 AsyncStorage 데이터 가져오기 (없으면 빈 배열)
    const storedPill = await AsyncStorage.getItem(DB.PILL_KEY);
    const storedPillDetail = await AsyncStorage.getItem(DB.PILL_DETAIL_KEY);
    const storedPillTakeLog = await AsyncStorage.getItem(DB.PILL_TAKE_LOG_KEY);

    let currentMstList: DB.PILL[] = storedPill ? JSON.parse(storedPill) : [];
    let currentDtlList: DB.PILL_DETAIL[] = storedPillDetail ? JSON.parse(storedPillDetail) : [];
    let currentLogList: DB.PILL_TAKE_LOG[] = storedPillTakeLog ? JSON.parse(storedPillTakeLog) : [];

    // 이미 동일한 UUID의 테스트 데이터가 존재한다면 제거 후 새로 삽입 (중복 방지)
    currentMstList = currentMstList.filter((item) => item.P_UUID !== targetUuid);
    currentDtlList = currentDtlList.filter((item) => item.P_UUID !== targetUuid);
    currentLogList = currentLogList.filter((item) => item.P_UUID !== targetUuid);

    // 2. 마스터 데이터 생성 (1개)
    const newMstData: DB.PILL = {
      P_UUID: targetUuid,
      P_NM: '테스트용',
      P_D_TK_FREQ: 3,
      DEL_YN: 'N',
      REG_DT: '2026-09-21 11:11:11',
      MOD_DT: '2026-09-21 11:11:11',
      DEL_DT: null,
    };

    // 3. 디테일 데이터 생성 (4개: a, b, c, d)
    const newDtlList: DB.PILL_DETAIL[] = [
      {
        P_UUID: targetUuid,
        P_TK_TN: 1,
        P_TK_TM: '10:00',
        USE_YN: 'Y',
        DEL_YN: 'N',
        REG_DT: '2026-09-21 11:11:11',
        MOD_DT: '2026-09-21 11:11:11',
        DEL_DT: null,
      },
      {
        P_UUID: targetUuid,
        P_TK_TN: 2,
        P_TK_TM: '12:00',
        USE_YN: 'Y',
        DEL_YN: 'N',
        REG_DT: '2026-09-21 11:11:11',
        MOD_DT: '2026-09-21 11:11:11',
        DEL_DT: null,
      },
      {
        P_UUID: targetUuid,
        P_TK_TN: 3,
        P_TK_TM: '14:00',
        USE_YN: 'Y',
        DEL_YN: 'N',
        REG_DT: '2026-09-21 11:11:11',
        MOD_DT: '2026-09-21 11:11:11',
        DEL_DT: null,
      }
    ];

    // 4. 로그 데이터 생성 (총 8개: 9/17 4개, 9/18 4개)
    //const logDates = ['2026-09-18', '2026-09-19'];
    const logDates = ['2026-09-21'];
    const times = ['10:00', '12:00', '14:00'];
    //const useYnList = ['Y', 'Y', 'Y',];
    const takeChkYnList = ['Y', 'N', 'Y',];

    const newLogList: DB.PILL_TAKE_LOG[] = [];

    logDates.forEach((date) => {
      times.forEach((time, index) => {
        newLogList.push({
          P_UUID: targetUuid,
          P_TK_DT: date,
          P_TK_TN: index + 1,
          P_TK_TM: time,
          P_TK_CHK_YN: takeChkYnList[index],
          USE_YN: 'Y',
          DEL_YN: 'N',
          REG_DT: '2026-09-21 11:11:11',
          MOD_DT: '2026-09-21 11:11:11',
          DEL_DT: null,
        });
      });
    });

    // 5. 기존 데이터와 병합
    const updatedMst = [...currentMstList, newMstData];
    const updatedDtl = [...currentDtlList, ...newDtlList];
    const updatedLog = [...currentLogList, ...newLogList];

    // 6. AsyncStorage에 저장
    await AsyncStorage.setItem(DB.PILL_KEY, JSON.stringify(updatedMst));
    await AsyncStorage.setItem(DB.PILL_DETAIL_KEY, JSON.stringify(updatedDtl));
    await AsyncStorage.setItem(DB.PILL_TAKE_LOG_KEY, JSON.stringify(updatedLog));

    // 7. 현재 화면의 React State도 함께 업데이트 (삭제되지 않은 N인 항목만 필터링)
    setLocalTablePill(updatedMst.filter((item) => item.DEL_YN === 'N').sort((a,b) => (b.REG_DT).localeCompare(a.REG_DT)));
    setLocalTablePillDetail(updatedDtl.filter((item) => item.DEL_YN === 'N'));
    setLocalTablePillTakeLog(updatedLog.filter((item) => item.DEL_YN === 'N'));

    console.log('테스트 데이터 등록 성공!');
  } catch (e) {
    console.error('테스트 데이터 등록 중 오류 발생:', e);
  }
};
    
  return (

    <View style={styles.container}>
      {/* 상단 헤더 영역  */}
      <View style={styles.topSection}>
        <SafeAreaView style={{flexDirection: 'row', justifyContent: 'space-between', paddingBottom: -30}}>
          {/* 왼쪽 영역 */}
          <View style={{flexDirection: 'row', alignItems: 'center', gap:10}}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'black', paddingLeft: 25, paddingTop: 15}}>
            약
            </Text>
          </View>
          {/* 오른쪽 영역 */}
          <View style={styles.rightHeader}>
            {/* 업로드 버튼 */}
            <TouchableOpacity style={styles.rightHeaderIconButton} activeOpacity={0.7} onPress={testReset}>
              <Ionicons name="cloud-upload-outline" size={24} color="black"/>
            </TouchableOpacity>
            {/* 다운로드 버튼 */}
            <TouchableOpacity style={styles.rightHeaderIconButton} activeOpacity={0.7} onPress={test}>
              <Ionicons name="cloud-download-outline" size={24} color="black" />
            </TouchableOpacity>
            {/* 다운로드 버튼 */}
            <TouchableOpacity style={styles.rightHeaderIconButton} activeOpacity={0.7} onPress={addTest}>
              <Ionicons name="add-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
      {/* 헤더, 약 목록 구분선 */}
      <View style={styles.topDivider}></View>
      {/* 약 목록 카드 부분 */}
      <ScrollView>
        {localTablePill.length === 0 ? (
          /* 데이터가 없을 때 표시할 안내 */
          <View style={{ paddingVertical: 40, alignItems: 'center', marginTop: 150 }}>
            <Text style={{ fontSize: 20, color: '#888888', textAlign: 'center'}}>
              등록된 약이 없습니다. {"\n"} + 버튼을 눌러 추가해 보세요
            </Text>
          </View>
        ) : (
          /* PILL 테이블 데이터 기반으로 동적으로 생성 */
          localTablePill.map((item) => (
            /* 약 목록 카드 영역 */
            <View key={item.P_UUID} style={styles.bottomCard}>
              {/* 약 이름 */}
              <Text style={styles.cardTitle}>{item.P_NM}</Text>
              {/* 약이름 / 정보 구분선 */}
              <View style={styles.cardDivider} />
              {/* 약 정보 */}
              <View style={styles.cardContent}>
                {/* 왼쪽 영역 */}
                <View style={styles.takeFreqContainer}>
                  <Text style={styles.takeFreqText}>하루 복용횟수</Text>
                  {/* 동적으로 연동되는 횟수 텍스트 */}
                  <Text style={styles.takeFreqText}>{item.P_D_TK_FREQ}회</Text>
                </View>
                {/* 오른쪽 영역 */}
                <View style={styles.pillListBtnGroup}>
                  {/* 수정 버튼 */}
                  <TouchableOpacity 
                    style={styles.pillListBtn} 
                    activeOpacity={0.7}>
                    <View><Text style={styles.pillListBtnText} onPress={() => {testUpdateBtnClick(item); setMode('U');}}>수정</Text></View>  
                  </TouchableOpacity>
                  {/* 삭제 버튼 */}
                  <TouchableOpacity 
                    style={styles.pillListBtn} 
                    activeOpacity={0.7}>
                    <View><Text style={styles.pillListBtnText}>삭제</Text></View>    
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {/* 약 추가 버튼 */}
      <TouchableOpacity 
        style={styles.pillAddBtn} 
        activeOpacity={0.8}
        onPress={() => {
          setPillRegModalVisible(true); 
          setMode('C');
        }}>
        <Text style={styles.pillAddBtnText}>+</Text>
      </TouchableOpacity>


      {/*****************************************************************/}  
      {/***** 모달 영역 시작 *********************************************/}  
      {/***** 모달 영역 시작 *********************************************/}  
      {/***** 모달 영역 시작 *********************************************/}
      {/*****************************************************************/}    


      {/* 약 등록 모달 (풀스크린) */}  
      <Modal
        animationType="slide"
        transparent={false}
        visible={pillRegModalVisible}
        onRequestClose={pillRegCls}>
        {/* 약 등록 모달 전체 영역 */}  
        <SafeAreaView style={styles.pillRegModalContainer}>
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity
            style={styles.pillRegBackBtn}
            onPress={pillRegCls}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
          {/* 본문 영역 */}
          <ScrollView 
            style={styles.pillRegModalContent}
            contentContainerStyle={{ gap: 50, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}>
            {/* 약 이름 영역 */}
            <View style={styles.pillRegRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.pillRegLabel}>약 이름</Text>
              </View>
              {/* 약 이름 입력 */}
              <TextInput
                style={styles.pillRegNameInput}
                value={pillRegName}
                onChangeText={setPillRegName}
              />
            </View>
            {/* 복용 횟수 선택 영역 */}
            <View style={styles.pillRegRow}>
              <Text style={styles.pillRegLabel}>하루 복용 횟수</Text>
              {/* 복용 횟수 버튼 */}
              <TouchableOpacity style={styles.pillRegTakeFreqBtn} onPress={takeFreqBtnClk}>
                <Text style={styles.pillRegTakeFreqBtnText}>{pillRegTakeFreq}</Text>
              </TouchableOpacity>
            </View>
            {/* 복용 횟수만큼 동적으로 생성되는 표 영역 */}
            <View style={styles.pillTakeTimeTableContainer}>
              {Array.from({ length: pillRegTakeFreq }).map((_, index) => {
                  const displayTime = pillTakeTimeArray[index] || `${((18 + index) % 24).toString().padStart(2, '0')}:00`;

                  return (
                    <View key={index} style={[styles.pillTakeTimeTableRow, index === pillRegTakeFreq - 1 && { borderBottomWidth: 0 }]}>
                      <Text style={styles.pillTakeTurnText}>{index + 1}회차 복용</Text>
                      <TouchableOpacity 
                        style={styles.pillTakeTimeBtn} 
                        activeOpacity={0.7} 
                        onPress={() => takeTurnTmClk(index)}>
                        <Text style={styles.pillTakeTimeBtnText}>{displayTime}</Text>
                      </TouchableOpacity>
                    </View>
                  );
              })}
            </View>
          </ScrollView>
          {/* 하단 확인 버튼 영역 */}
          <View style={styles.pillRegConfirmBtnContainer}>
            {/* 확인 버튼 */}
            <TouchableOpacity
              style={[
                styles.pillRegConfirmBtn,
                regNameChk() && styles.pillRegConfirmBtnDisable, 
              ]}
              activeOpacity={0.8}
              disabled={regNameChk()} //!pillRegName.trim()
              onPress={pillRegConfirmBtnClick}>
              <Text style={styles.pillRegConfirmBtnText}>확인</Text>
            </TouchableOpacity>
          </View>
          {/* 약 복용 횟수 모달(바텀시트) */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={pillTakeFreqModalVisible}
            onRequestClose={() => setPillTakeFreqModalVisible(false)}
            onShow={() => {
              // 10 대신 NUMBERS.length(5)를 더해 중앙 세트로 위치 맞춤
              const targetIndex = takeFreqArray.length + (takeFreq - 1);
              pillTakeFreqRef.current?.scrollToIndex({
                index: targetIndex,
                animated: false,
              });
            }}>
            {/* 약 복용 횟수 모달 전체 영역 */}  
            <View style={styles.sheetOverlay}>
              {/* 모달 외 부분 누를 시 모달 닫기 버튼 */}
              <TouchableOpacity 
                style={{ flex: 1 }} 
                activeOpacity={1} 
                onPress={() => setPillTakeFreqModalVisible(false)} />
              {/* 약 복용 횟수 모달 본문 영역 */}
              <View style={styles.sheetContainer}>
                {/* 닫기 x 버튼 */}
                <TouchableOpacity 
                  style={styles.sheetCloseButton} 
                  onPress={() => setPillTakeFreqModalVisible(false)}>
                  <Ionicons name="close" style={styles.closeBtn} />
                </TouchableOpacity>
                <Text style={styles.sheetText}>하루 복용 횟수를 지정해주세요</Text>
                {/* 복용 횟수 피커 영역 */}
                <View style={styles.pillTakeFreqPickerWrapper}>
                  {/* 피커 값 구분 가로선 */}
                  <View style={styles.pickerValueDivOverlay} pointerEvents="none" />
                   {/* 복용 횟수 설정 피커 */}
                  <FlatList
                    ref={pillTakeFreqRef}
                    data={takeFreqLoop}
                    keyExtractor={(_, index) => index.toString()}
                    windowSize={5}                   
                    maxToRenderPerBatch={5}          
                    removeClippedSubviews={Platform.OS === 'android'} 
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onScrollEndDrag={takeFreqPickerHandler} 
                    onMomentumScrollEnd={takeFreqPickerHandler}
                    contentContainerStyle={{
                      paddingVertical: ITEM_HEIGHT, 
                    }}
                    getItemLayout={(_, index) => ({
                      length: ITEM_HEIGHT,
                      offset: ITEM_HEIGHT * index,
                      index,
                    })}
                    renderItem={({ item }) => {
                      const isSelected = item === takeFreq;
                      return (
                        // 피커 그리기 
                        <View style={styles.pickerItem}>
                          <Text
                            style={[
                              styles.pickerItemText,
                              isSelected ? styles.pickerSelectedText : styles.pickerUnselectedText,
                            ]}
                          >
                            {item}
                          </Text>
                        </View>
                      );
                    }}
                  />
                </View>
                {/* 확인 버튼 */}
                <TouchableOpacity 
                  style={styles.sheetConfirmButton} 
                  onPress={takeFreqCfmBtnClk}>
                  <Text style={styles.sheetConfirmText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* 약 복용 시간 모달(바텀시트) */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={takeTimeModalVisible}
            onRequestClose={() => setTakeTimeModalVisible(false)}
            onShow={() => {
              // 시 피커 시작 위치 중앙 설정
              const hourParseInt = parseInt(takeHour, 10) || 0;
              const hourSetSize = hourData.length; 
              const targetHourIndex = hourSetSize * 1 + hourParseInt;

              takeHourPickerRef.current?.scrollToIndex({
                index: targetHourIndex,
                animated: false,
              });

              // 분 피커 시작 위치 중앙 설정
              const minIndex = minData.indexOf(takeMin) !== -1 ? minData.indexOf(takeMin) : 0;
              const minSetSize = minData.length; 
              const targetMinIndex = minSetSize * 5 + minIndex;

              takeMinPickerRef.current?.scrollToIndex({
                index: targetMinIndex,
                animated: false,
              });
            }}>
            {/* 약 복용 시간 전체 영역 */}  
            <View style={styles.sheetOverlay}>
              {/* 모달 외 부분 누를 시 모달 닫기 버튼 */}
              <TouchableOpacity 
                style={{ flex: 1 }} 
                activeOpacity={1} 
                onPress={() => setTakeTimeModalVisible(false)} />
              {/* 약 복용 시간 본문 영역 */}
              <View style={styles.sheetContainer}>
                {/* 닫기 x 버튼 */}
                <TouchableOpacity 
                  style={styles.sheetCloseButton} 
                  onPress={() => setTakeTimeModalVisible(false)}>
                  <Ionicons name="close" style={styles.closeBtn} />
                </TouchableOpacity>
                <Text style={styles.sheetText}>복용 시간을 지정해주세요</Text>
                {/* 시간 피커 영역 */}
                <View style={styles.pillTakeHourPickerWrapper}>
                  {/* 피커 값 구분 가로선 */}
                  <View style={styles.pickerValueDivOverlay} pointerEvents="none" />
                  {/* '시' 피커 설정 */}        
                  <FlatList
                    ref={takeHourPickerRef}
                    data={hourLoop}
                    keyExtractor={(_, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    //onScroll={takeTimeHourPickerHandler} 
                    //scrollEventThrottle={16} 
                    onMomentumScrollEnd={takeTimeHourPickerHandler}
                    onScrollEndDrag={takeTimeHourPickerHandler}
                    contentContainerStyle={{
                      paddingVertical: ITEM_HEIGHT,
                    }}
                    getItemLayout={(_, index) => ({
                      length: ITEM_HEIGHT,
                      offset: ITEM_HEIGHT * index,
                      index,
                    })}
                    style={styles.pillTakeTimePickerColumn}
                    renderItem={({ item }) => {
                      const isSelected = item === takeHour;
                      return (
                        // 피커 그리기
                        <View style={styles.pickerItem}>
                          <Text
                            style={[
                              styles.pickerItemText,
                              isSelected ? styles.pickerSelectedText : styles.pickerUnselectedText,
                            ]}
                          >
                            {item}
                          </Text>
                        </View>
                      );
                    }}/>
                  {/* 시,분 구분 세미콜론 */}
                  <View style={styles.colonContainer} pointerEvents="none">
                    <Text style={styles.colonText}>:</Text>
                  </View>
                  {/* 두번째 피커 */}
                  <FlatList
                    ref={takeMinPickerRef}
                    data={minLoop}
                    keyExtractor={(_, index) => `right-${index}`}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    //onScroll={takeTimeMinPickerHandler}
                    //scrollEventThrottle={16}
                    onMomentumScrollEnd={takeTimeMinPickerHandler}
                    onScrollEndDrag={takeTimeMinPickerHandler}
                    contentContainerStyle={{
                      paddingVertical: ITEM_HEIGHT,
                    }}
                    getItemLayout={(_, index) => ({
                      length: ITEM_HEIGHT,
                      offset: ITEM_HEIGHT * index,
                      index,
                    })}
                    style={styles.pillTakeTimePickerColumn}
                    renderItem={({ item }) => {
                      const isSelected = item === takeMin;
                      return (
                        <View style={styles.pickerItem}>
                          <Text
                            style={[
                              styles.pickerItemText,
                              isSelected ? styles.pickerSelectedText : styles.pickerUnselectedText,
                            ]}
                          >
                            {item}
                          </Text>
                        </View>
                      );
                    }}/>
                </View>
                {/* 확인 버튼 */}
                <TouchableOpacity 
                  style={styles.sheetConfirmButton} 
                  onPress={takeTurnTmCfmBtnClk}>
                  <Text style={styles.sheetConfirmText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </Modal>
      {/* 알림 모달 영역 */}
<Modal
  transparent={true}
  visible={alertModalVisible}
  animationType="fade"
  onRequestClose={alertModalHandler}>
  <View style={styles.alertModalOverlay}>
    {/* 바깥 배경 누를 시 모달 닫기 */}
    <TouchableOpacity
      style={StyleSheet.absoluteFillObject}
      activeOpacity={1}
      onPress={alertModalHandler} />

    {/* 모달 본문 영역 */}
    <View style={styles.alertModalContents}>
      <Text style={styles.alertModalTitle}>알림</Text>
      
      {/* 🚨 기존 "아직 오지 않은 날입니다." 하드코딩 제거 ➔ state 변수로 연결 */}
      <Text style={styles.alertModalText}>{alertModalMessage}</Text>
      
      <View style={styles.alertModalButtonContainer}>
        {/* 모달 닫기 확인 버튼 */}
        <TouchableOpacity
          style={styles.alertModalConfirmButton}
          activeOpacity={0.8}
          onPress={alertModalHandler}>
          <Text style={styles.alertModalConfirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </View>

    );
}

const styles = StyleSheet.create({
    
  container: {
    flex: 1, 
  },
  
  topSection: {
    paddingBottom: 5
  },

  rightHeader: {
    flexDirection: 'row',
    paddingTop: 15,
    paddingRight: 25,
    gap:10
  },

  rightHeaderIconButton: {
    backgroundColor: '#ebe8e8',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center', 
    alignItems: 'center',     
  },

  topDivider: {
    height: 2,
    backgroundColor: '#ebe8e8',
    marginBottom: 12,
    marginHorizontal: 15
  },

  pillAddBtn: {
    position: 'absolute',
    right: 20,              
    bottom: 20,             
    width: 60,              
    height: 60,             
    borderRadius: 30,       
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center'
  },

  pillAddBtnText: {
    color: 'white',
    fontSize: 50,
    fontWeight: '900', 
    marginTop: -7,
    marginLeft: 2,     
  },
  
  // ↓↓↓↓↓ 약 목록 카드 스타일 ↓↓↓↓↓ 약 목록 카드 스타일 ↓↓↓↓↓
  // ↓↓↓↓↓ 약 목록 카드 스타일 ↓↓↓↓↓ 약 목록 카드 스타일 ↓↓↓↓↓
  bottomCard: {
    backgroundColor: 'white', 
    height: 140,
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 15
  },

  cardTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 10,
      color: '#000000',
  },

  cardDivider: {
      height: 2,
      backgroundColor: '#ebe8e8',
      marginBottom: 12,
      marginHorizontal: 15
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },

  takeFreqText: {
    fontFamily: Platform.select({
    ios: 'Apple SD Gothic Neo',
    android: 'sans-serif-medium',
    }),
    includeFontPadding: false, 
    fontSize: 22, 
    fontWeight: '500',
    color: '#000000',        
  },

  pillListBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginRight:10
  },

  pillListBtn: {
    backgroundColor: '#ebe8e8',
    width: 75,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pillListBtnText: {
    fontSize: 18,
    fontWeight: 'bold'
  },

  takeFreqContainer: {
    flexDirection: 'column', 
    alignItems: 'center', 
  },
  // ↑↑↑↑↑ 약 목록 카드 스타일 ↑↑↑↑↑ 약 목록 카드 스타일 ↑↑↑↑↑
  // ↑↑↑↑↑ 약 목록 카드 스타일 ↑↑↑↑↑ 약 목록 카드 스타일 ↑↑↑↑↑



  // ↓↓↓↓↓ 약 등록 모달 영역 ↓↓↓↓↓ 약 등록 모달 영역 ↓↓↓↓↓
  // ↓↓↓↓↓ 약 등록 모달 영역 ↓↓↓↓↓ 약 등록 모달 영역 ↓↓↓↓↓
  pillRegModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },

  pillRegModalContent: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  
  pillRegBackBtn: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  pillRegRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50, 
  },

  pillRegLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },

  pillRegNameInput: {
    flex: 1,
    marginLeft: 15,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000',
    fontSize: 20,
    paddingVertical: 8,  
    paddingHorizontal: 5,
    color: '#000',       
  },

  pillRegTakeFreqBtn: {
    backgroundColor: '#CCCCCC',
    width: 80,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pillRegTakeFreqBtnText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },

  pillTakeTimeTableContainer: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 12,
    marginTop: 10,
    overflow: 'hidden',
  },

  pillTakeTimeTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  pillTakeTurnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },

  pillTakeTimeBtn: {
    backgroundColor: '#CCCCCC',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  pillTakeTimeBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },

  pillRegConfirmBtnContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30, 
  },

  pillRegConfirmBtn: {
    backgroundColor: '#000',
    height: 56,
    borderRadius: 16, 
    justifyContent: 'center',
    alignItems: 'center',
  },

  pillRegConfirmBtnText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  pillRegConfirmBtnDisable: {
    backgroundColor: '#CCCCCC', 
  },

  alertModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', 
    justifyContent: 'center',
    alignItems: 'center',
  },

  alertModalContents: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  alertModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },

  alertModalText: {
    fontSize: 17,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 28,
  },

  alertModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
  },

  alertModalConfirmButton: {
    backgroundColor: '#ebe8e8', 
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 4,
  },

  alertModalConfirmText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // ↑↑↑↑↑ 약 등록 모달 영역 ↑↑↑↑↑ 약 등록 모달 영역 ↑↑↑↑↑
  // ↑↑↑↑↑ 약 등록 모달 영역 ↑↑↑↑↑ 약 등록 모달 영역 ↑↑↑↑↑



  // ↓↓↓↓↓ 약 복용 시간 모달 영역 ↓↓↓↓↓ 약 복용 시간 모달 영역 ↓↓↓↓↓
  // ↓↓↓↓↓ 약 복용 시간 모달 영역 ↓↓↓↓↓ 약 복용 시간 모달 영역 ↓↓↓↓↓
  pillTakeTimePickerColumn: {
    flex: 1,
    height: ITEM_HEIGHT * 3,
  },
  
  pillTakeHourPickerWrapper: {
    height: ITEM_HEIGHT * 3,
    width: '100%',
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },

  // 시,분 구분 세미콜론
  colonContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, 
  },

  colonText: {
    fontSize: 28, 
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4, 
  },
  // ↑↑↑↑↑ 약 복용 시간 모달 영역 ↑↑↑↑↑ 약 복용 시간 모달 영역 ↑↑↑↑↑
  // ↑↑↑↑↑ 약 복용 시간 모달 영역 ↑↑↑↑↑ 약 복용 시간 모달 영역 ↑↑↑↑↑


 
  // 약 복용 횟수 모달 영역 ↓↓↓↓↓ 약 복용 횟수 모달 영역 ↓↓↓↓↓ 
  // 약 복용 횟수 모달 영역 ↓↓↓↓↓ 약 복용 횟수 모달 영역 ↓↓↓↓↓ 
  pillTakeFreqPickerWrapper: {
  height: ITEM_HEIGHT * 3, // 위 1개, 가운데 1개, 아래 1개 (총 3줄)
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  // 약 복용 횟수 모달 영역 ↑↑↑↑↑ 약 복용 횟수 모달 영역 ↑↑↑↑↑ 
  // 약 복용 횟수 모달 영역 ↑↑↑↑↑ 약 복용 횟수 모달 영역 ↑↑↑↑↑ 



  // ↓↓↓↓↓ 공통 영역 ↓↓↓↓↓ 공통 영역 ↓↓↓↓↓ 공통 영역 ↓↓↓↓↓ 공통 영역 ↓↓↓↓↓ 
  // ↓↓↓↓↓ 공통 영역 ↓↓↓↓↓ 공통 영역 ↓↓↓↓↓ 공통 영역 ↓↓↓↓↓ 공통 영역 ↓↓↓↓↓ 
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  sheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    alignItems: 'center',
    paddingBottom: 50, 
  },

  sheetCloseButton: {
    alignSelf: 'flex-start',
  },

  sheetText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
  },

  sheetConfirmButton: {
    backgroundColor: 'black',
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  sheetConfirmText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  pickerValueDivOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT, 
    height: ITEM_HEIGHT,
    width: '60%', 
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#EFEFEF',
  },

  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 26,
  },

  pickerSelectedText: {
    fontWeight: 'bold',
    color: '#000000', 
  },
  pickerUnselectedText: {
    fontWeight: 'normal',
    color: '#CCCCCC', 
  },

  closeBtn: {
    fontSize : 28,
    color : "black"
  }
  // 공통 영역 ↑↑↑↑↑ 공통 영역 ↑↑↑↑↑ 공통 영역 ↑↑↑↑↑ 공통 영역 ↑↑↑↑↑
  // 공통 영역 ↑↑↑↑↑ 공통 영역 ↑↑↑↑↑ 공통 영역 ↑↑↑↑↑ 공통 영역 ↑↑↑↑↑

});