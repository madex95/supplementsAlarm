import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import 'react-native-get-random-values';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';



// 로컬 저장 관련
const PILL_KEY = '@PILL';
const PILL_DETAIL_KEY = '@PILL_DETAIL';

interface PILL {
  P_UUID : string;
  P_NM : string;
  P_D_TK_FREQ : number;
}

interface PILL_DETAIL {
  P_UUID : string;
  P_NM : string;
  P_TK_TN : number;
  ALM_TM : string;
}




// 약 등록 부분 pillReg
const ITEM_HEIGHT = 50; // 피커 항목 1개의 높이
const takeFreqArray = [1, 2, 3, 4, 5];
// 데이터 반복 횟수
const repeatCnt = 5;
// 복용 횟수 루프 
const takeFreqLoop = Array.from({ length: repeatCnt }, () => takeFreqArray).flat();


// 복용 시간 부분 takeTm 
// 복용 시간의 '시' 루프 설정
const hourData = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const hourLoop = Array.from({ length: 2 }, () => hourData).flat();

// 복용 시간의 '분' 루프 설정
const minData = ['00', '10', '20', '30', '40', '50'];
const minLoop = Array.from({ length: 5 }, () => minData).flat();



export default function pillScreen(){
  // 로컬 데이터가 저장될 state
  const [localTablePill, setLocalTablePill] = useState<PILL[]>([]);
  const [localTablePillDetail, setLocalTablePillDetail] = useState<PILL_DETAIL[]>([]);

  // 앱이 켜질 때 저장된 데이터 불러오기
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedPill = await AsyncStorage.getItem(PILL_KEY);
        const storedPillDetail = await AsyncStorage.getItem(PILL_DETAIL_KEY);

        if (storedPill) setLocalTablePill(JSON.parse(storedPill));
        if (storedPillDetail) setLocalTablePillDetail(JSON.parse(storedPillDetail));
      } catch (e) {
        console.error('데이터 불러오기 실패:', e);
      }
    };

    loadStoredData();
  }, []);



  // 임시 스크롤 값
  //const [tempDoseCount, setTempDoseCount] = useState(1);  

  // 모달 visible
  //const [modalVisible, setModalVisible] = useState(false); 



  // ↓↓↓↓↓ 약 등록 모달 부분 ↓↓↓↓↓ 약 등록 모달 부분 ↓↓↓↓↓
  // ↓↓↓↓↓ 약 등록 모달 부분 ↓↓↓↓↓ 약 등록 모달 부분 ↓↓↓↓↓

  // 풀스크린 모달 열림/닫힘
  const [pillRegModalVisible, setPillRegModalVisible] = useState(false);

  // 약 이름
  const [pillRegName, setPillRegName] = useState('');

  // 약 등록 복용 횟수
  const [pillRegTakeFreq, setPillRegTakeFreq] = useState(1);   

  // 복용 횟수 버튼 클릭 시 실행 함수
  const takeFreqBtnClk = () => {
    //take Frequency Botton Click
    console.log("복용 횟수 버튼 클릭");

    setTakeFreq(pillRegTakeFreq);// 복용 횟수 모달에서의 복용 횟수 세팅
    setPillTakeFreqModalVisible(true);
  };
  
  // 회색 숫자 버튼 부분
  const flatListRef = useRef<FlatList>(null);

  // 약 등록 확인 버튼 클릭 시 실행 함수
  const pillRegConfirmBottonClick = async () => {
    // pill regist confirm botton click
    console.log("약 등록 확인 버튼 클릭");
    
    const newUuid = uuidv4();

    // A 테이블 (1개)
    const newTablePill: PILL = {
      P_UUID: newUuid,
      P_NM: pillRegName,
      P_D_TK_FREQ: pillRegTakeFreq,
    };

    // B 테이블 (takeCount 개수만큼 N개)
    const newTablePillDetail: PILL_DETAIL[] = Array.from({ length: pillRegTakeFreq }).map((_, index) => {
      const time = pillTakeTimes[index] || `${((18 + index) % 24).toString().padStart(2, '0')}:00`;
      return {
        P_UUID: newUuid,
        P_NM: pillRegName,
        ALM_TM: time,
        P_TK_TN: index + 1, // 1, 2, 3, 4, 5
      };
    });

    const updatedA = [...localTablePill, newTablePill];
    const updatedB = [...localTablePillDetail, ...newTablePillDetail];

    try {
      // 로컬 저장소에 저장 (앱을 껐다 켜도 유지)
      await AsyncStorage.setItem(PILL_KEY, JSON.stringify(updatedA));
      await AsyncStorage.setItem(PILL_DETAIL_KEY, JSON.stringify(updatedB));

      setLocalTablePill(updatedA);
      setLocalTablePillDetail(updatedB);

      console.log('AsyncStorage 저장 완료');

      const storedA = await AsyncStorage.getItem(PILL_KEY);
      const storedB = await AsyncStorage.getItem(PILL_DETAIL_KEY);
      console.log('==== [Storage PILL 테이블 데이터] ====');
      console.log(storedA ? JSON.parse(storedA) : null);
      
      console.log('==== [Storage PILL_DETAIL 테이블 데이터] ====');
      console.log(storedB ? JSON.parse(storedB) : null);
      console.log('============================================');
      
      pillRegCls(); // 모달 a닫기 및 입a력값 초기화

    } catch (e) {
      console.error('저장 실패:', e);
    }
  };

  // 약 등록 모달 닫힐 시 실행 함수
  const pillRegCls = () => {
    setPillRegName('');  // 약 등록 이름 초기화
    setPillRegTakeFreq(1);  // 약 등록 복용 횟수 초기화
    setPillTakeTimes(['10:00']); // 약 복용 시간 초기화
    setPillRegModalVisible(false); // 약 등록 모달 가리기
  }

  // ↑↑↑↑↑ 풀스크린 모달 부분 ↑↑↑↑↑ 풀스크린 모달 부분 ↑↑↑↑↑
  // ↑↑↑↑↑ 풀스크린 모달 부분 ↑↑↑↑↑ 풀스크린 모달 부분 ↑↑↑↑↑

 

  // ↓↓↓↓↓ 복용 횟수 바텀시트 부분 ↓↓↓↓↓ 복용 횟수 바텀시트 부분 ↓↓↓↓↓
  // ↓↓↓↓↓ 복용 횟수 바텀시트 부분 ↓↓↓↓↓ 복용 횟수 바텀시트 부분 ↓↓↓↓↓

  const [takeFreq, setTakeFreq] = useState(1);  
  const [pillTakeFreqModalVisible, setPillTakeFreqModalVisible] = useState(false); 

  // 복용 횟수 휠 피커
  const handleScrollEnd = (event: any) => {
    // 수직 스크롤 위치 추출 (피커마다 선언 권장)
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // 현재 피커 중앙에 위치한 항목의 인덱스 값 구하기
    const index = Math.round(offsetY / ITEM_HEIGHT);

    // 해당 인덱스 값에 해당하는 복용횟수
    const selectedValue = takeFreqLoop[index];

    // 값이 존재하고 기존의 선택된 값과 다를 경우 해당 복용횟수 세팅
    if (selectedValue && selectedValue !== takeFreq) {
      setTakeFreq(selectedValue);
    }

    // 세트 수 지정
    const setSize = takeFreqArray.length; 

    // 사용자가 스크롤을 위로 많이 올려 첫번째 세트 영역 도달 체크
    if (index < setSize) {
      // 중앙 세트의 동일 값으로 이동
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: index + setSize, animated: false });
      }, 10);
    } 
    //  사양자가 스크롤을 아래로 많이 내려서 세번째 세트 영역 도달 체크
    else if (index >= setSize * 2) {
      // 중앙 세트의 동일 값으로 이동
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: index - setSize, animated: false });
      }, 10);
    }
  };

  // 복용 횟수 바텀시트의 확인 버튼 클릭 함수
  const takeFreqCfmBtnClk = () => {
    //  take Freaquency Confirm Botton Click
    console.log("복용 횟수 확인 버튼 클릭")

    // 복용횟수 세팅
    setPillRegTakeFreq(takeFreq);

    // 2. 현재 설정되어 있는 시간 배열 복사
    const updatedTimes = [...pillTakeTimes];

    // 3. 만약 새로 선택한 횟수(takeFreq)가 기존 배열 길이보다 크다면 (줄이 늘어나는 경우)
    if (takeFreq > updatedTimes.length) {
      // 현재 배열의 마지막 시간 가져오기 (없을 경우 기본 '18:00')
      const lastTime = updatedTimes[updatedTimes.length - 1];
      const lastHour = parseInt(lastTime.split(':')[0], 10);

      // 부족한 개수만큼 반복하며 마지막 시간에 +2시간씩 추가
      const addedCount = takeFreq - updatedTimes.length;
      for (let i = 1; i <= addedCount; i++) {
        const newHour = ((lastHour + i * 2) % 24).toString().padStart(2, '0');
        updatedTimes.push(`${newHour}:00`);
      }
    } 
    // 4. 만약 횟수를 줄인 경우라면 선택한 횟수만큼 배열을 자름
    else if (takeFreq < updatedTimes.length) {
      updatedTimes.splice(takeFreq);
    }

    // 5. 변경된 시간 배열 반영
    setPillTakeTimes(updatedTimes);

    setPillTakeFreqModalVisible(false);
  };

  // ↑↑↑↑↑ 복용 횟수 바텀시트 부분 ↑↑↑↑↑ 복용 횟수 바텀시트 부분 ↑↑↑↑↑
  // ↑↑↑↑↑ 복용 횟수 바텀시트 부분 ↑↑↑↑↑ 복용 횟수 바텀시트 부분 ↑↑↑↑↑



  // ↓↓↓↓↓ 복용 회차별 시간 바텀시트 부분 ↓↓↓↓↓ 복용 회차별 시간 바텀시트 부분 ↓↓↓↓↓
  // ↓↓↓↓↓ 복용 회차별 시간 바텀시트 부분 ↓↓↓↓↓ 복용 회차별 시간 바텀시트 부분 ↓↓↓↓↓

  // 2. 시간 선택 관련 State
  const [pillTakeTimes, setPillTakeTimes] = useState<string[]>(['10:00']); // 각 회차별 시간 저장
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0); // 수정 중인 표의 행 인덱스

  // 복용 회차별 시간 클릭 시 실행 함수
  const takeTurnTmClk = (index:number) => {
    // take Turn Time Click
    console.log("복용 회차 시간 클릭 " + index);
    
    setSelectedRowIndex(index);
    const currentTime = pillTakeTimes[index] || `${((18 + index) % 24).toString().padStart(2, '0')}:00`;
    const [h,m] = currentTime.split(':'); // 시간,분 분리
    
    setTakeHour(h); // 시 피커 값 할당
    setTakeMin(m); // 분 피커 값 할당

    setTestSheetVisible(true);
  }

  const [testSheetVisible, setTestSheetVisible] = useState(false);     // 시간 바텀시트 열림 여부

  // 시간 피커용 State 및 Ref
  const [takeHour, setTakeHour] = useState<string>('01');
  const firstFlatListRef = useRef<FlatList>(null);

  // 복용 회차 시간 모달 시간
  const [takeTurnTmModalHour, setTakeTurnTmModalHour] = useState<string>('01');

  // 복용 시간의 '시' 피커가 돌면서 멈춤 감지 시 실행 함수
  const takeTmHrPickerStop = (event: any) => {
    // take Time Hour Picker Stop
    //console.log("복용 시간 '시' 피커 멈춤");

    const offsetY = event.nativeEvent.contentOffset.y;
    const targetIndex = Math.round(offsetY / ITEM_HEIGHT);
    
    const selectedHour = hourLoop[targetIndex];
    if (selectedHour && selectedHour !== takeHour) {
      setTakeHour(selectedHour);
    }

    // 무한 루프 보정 (2세트 범위 0~47 내에서 동작)
    const setSize = hourData.length; // 24
    if (targetIndex >= setSize) {
      // 1세트를 넘어가면 0세트 위치로 순간이동
      setTimeout(() => {
        firstFlatListRef.current?.scrollToIndex({
          index: targetIndex % setSize,
          animated: false,
        });
      }, 10);
    }
  };
  
  // ↑↑↑↑↑ 복용 회차별 시간 바텀시트 부분 ↑↑↑↑↑ 복용 회차별 시간 바텀시트 부분 ↑↑↑↑↑
  // ↑↑↑↑↑ 복용 회차별 시간 바텀시트 부분 ↑↑↑↑↑ 복용 회차별 시간 바텀시트 부분 ↑↑↑↑↑
  



//테스트영역 테스트영역 테스트영역 
//테스트영역 테스트영역 테스트영역 
//테스트영역 테스트영역 테스트영역 
// 테스트영역 테스트영역 테스트영역 


  const test = async() => {
    try {
        // 1. AsyncStorage에 저장된 특정 키의 데이터 삭제
        await AsyncStorage.removeItem(PILL_KEY);
        await AsyncStorage.removeItem(PILL_DETAIL_KEY);

        // 2. 화면에 연결된 React State도 빈 배열로 초기화 (UI 즉시 반영)
        setLocalTablePill([]);
        setLocalTablePillDetail([]);

        console.log('약 테이블 데이터가 초기화되었습니다.');
      } catch (e) {
        console.error('초기화 실패:', e);
      }
  }

//const [takeTmHour, setTakeTmHour] = useState<string>('01');  // 바텀시트 임시 스크롤 값



  // 복용 회차별 시간 바텀시트의 확인 버튼 클릭시 실행 함수
  const takeTurnTmCfmBtnClk = () => {
    // take Turn Time Cofirm Botton Click
    console.log("복용 회차 시간 확인 버튼 클릭");

    // 1. 기존 intakeTimes 배열을 복사
    const updatedTimes = [...pillTakeTimes];
    
    // 2. 현재 선택된 행(selectedRowIndex)의 시간을 휠 피커에서 선택한 값으로 변경
    updatedTimes[selectedRowIndex] = `${takeHour}:${takeMin}`;

    // 3. 빠른 시간 순(오름차순)으로 배열 정렬
    updatedTimes.sort((a, b) => a.localeCompare(b));

    // 4. 정렬된 시간 배열 반영
    setPillTakeTimes(updatedTimes);

    //console.log("takeTurnTmModalTempCnt " + takeTurnTmModalTempCnt);
    setTestSheetVisible(false);

  };

// 2. [추가] 두 번째 피커용 State 및 Ref
const [takeMin, setTakeMin] = useState('00');
const secondFlatListRef = useRef<FlatList>(null);

// 3. [추가] 두 번째 피커 전용 스크롤 감지 함수
const handleSecondScrollEnd = (event: any) => {
  const offsetY = event.nativeEvent.contentOffset.y;
  const targetIndex = Math.round(offsetY / ITEM_HEIGHT);
  
  const selectedMin = minLoop[targetIndex];
  if (selectedMin && selectedMin !== takeMin) {
    setTakeMin(selectedMin);
  }

  // 무한 루프 보정 (5세트 중 범위 초과 시 중앙 세트인 2세트로 순간이동)
  const setSize = minData.length; // 6
  if (targetIndex < setSize || targetIndex >= setSize * 4) {
    const realIndex = targetIndex % setSize;
    setTimeout(() => {
      secondFlatListRef.current?.scrollToIndex({
        index: setSize * 2 + realIndex, // 중앙인 12~17 범위로 이동
        animated: false,
      });
    }, 10);
  }
};

  // 바텀시트 [확인] 버튼 클릭
  // const testConfirmDoseCount = () => {
  //   setDoseCount(tempDoseCount);
  //   setTestSheetVisible(false);
  // };



    
  return (

    <View style={styles.container}>
      {/* 1. 상단 영역 (50% 높이, 빨간색 배경) */}
      <View style={styles.topSection}>
      {/* 이 안에 윗부분에 들어갈 컴포넌트들을 넣습니다 */}
        <SafeAreaView style={{flexDirection: 'row', justifyContent: 'space-between', paddingBottom: -30}}>
          {/* 왼쪽 영역: View로 감싸서 가로 정렬 */}
          <View style={{flexDirection: 'row', alignItems: 'center', gap:10}}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'black', paddingLeft: 25, paddingTop: 15}}>
            약
            </Text>
          </View>

          {/* 오른쪽 영역 */}
          <View style={styles.rightHeader}>
            <TouchableOpacity style={styles.rightHeaderIconButton} activeOpacity={0.7} onPress={test}>
              <Ionicons name="cloud-upload-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rightHeaderIconButton} activeOpacity={0.7}>
              <Ionicons name="cloud-download-outline" size={24} color="black" />
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.rightHeaderIconButton} activeOpacity={0.7} onPress={()=>setModalVisible(true)}>
              <Ionicons name="logo-google" size={24} color="black" />
            </TouchableOpacity> */}
          </View>
        </SafeAreaView>
      </View>
      {/* 헤더, 약 목록 컨탠츠 구분선 */}
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
    /* Storage PILL 테이블 데이터 동적 렌더링 */
    localTablePill.map((item) => (
      <View key={item.P_UUID} style={styles.bottomCard}>
        {/* 약 이름 */}
        <Text style={styles.cardTitle}>{item.P_NM}</Text>
        
        {/* 약이름 / 내용 구분선 */}
        <View style={styles.cardDivider} />
        
        {/* 약 내용 */}
        <View style={styles.cardContent}>
          <View style={styles.takeFreqContainer}>
            <Text style={styles.takeFreqText}>하루 복용횟수</Text>
            {/* 동적으로 연동되는 횟수 텍스트 */}
            <Text style={styles.takeFreqText}>{item.P_D_TK_FREQ}회</Text>
          </View>
          
          <View style={styles.pillListBottonGroup}>
            <TouchableOpacity 
              style={styles.pillListButton} 
              activeOpacity={0.7}>
              <View><Text style={styles.pillListButtonText}>수정</Text></View>  
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.pillListButton} 
              activeOpacity={0.7}>
              <View><Text style={styles.pillListButtonText}>삭제</Text></View>    
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ))
  )}
</ScrollView>


















      {/* Floating Action Button (플로팅 버튼) */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => {
          setPillRegModalVisible(true); // 버튼 클릭 시 풀스크린 모달 시작!
        }}
      >
        {/* <Ionicons name="add-sharp" size={32} color="white" /> */}
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* +버튼 눌렀을 때 모달창 */}  
      <Modal
        animationType="slide"
        transparent={false}
        visible={pillRegModalVisible}
        onRequestClose={pillRegCls}
      >
        {/* SafeAreaView가 상단 상태바 & 하단 내비게이션 바 영역을 완벽히 보호해 줍니다 */}
        <SafeAreaView style={styles.fullModalContainer}>
          {/* <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          > */}
            {/* 뒤로가기 버튼 */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={pillRegCls}
            >
              <Ionicons name="arrow-back" size={28} color="red" />
            </TouchableOpacity>

            {/* 본문 영역 */}
            <ScrollView 
              style={styles.fullModalContent}
              contentContainerStyle={{ gap: 50, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* 약 이름 입력 */}
              <View style={styles.inputRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.labelTitle}>약 이름</Text>
                </View>
                <TextInput
                  style={styles.medicineInput}
                  value={pillRegName}
                  onChangeText={setPillRegName}
                />
              </View>

              {/* 하루 복용 횟수 선택 영역 */}
              <View style={styles.inputRow}>
                <Text style={styles.labelTitle}>하루 복용 횟수</Text>
                <TouchableOpacity style={styles.countBadge} onPress={takeFreqBtnClk}>
                  <Text style={styles.countBadgeText}>{pillRegTakeFreq}</Text>
                </TouchableOpacity>
              </View>

              {/* doseCount 크기만큼 동적으로 생성되는 복용 시간 표 */}
              <View style={styles.timeTableContainer}>
                {Array.from({ length: pillRegTakeFreq }).map((_, index) => {
                  const displayTime = pillTakeTimes[index] || `${((18 + index) % 24).toString().padStart(2, '0')}:00`;
                  return (
                    <View key={index} style={[styles.timeTableRow, index === pillRegTakeFreq - 1 && { borderBottomWidth: 0 }]}>
                      <Text style={styles.timeTableLabel}>{index + 1}회차 복용</Text>
                      <TouchableOpacity 
                        style={styles.timeBadge} 
                        activeOpacity={0.7} 
                        //onPress={() => openTimeSheet(index)}
                        onPress={() => takeTurnTmClk(index)}
                      >
                        {/* 2. displayTime 변수를 출력 */}
                        <Text style={styles.timeBadgeText}>{displayTime}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* 하단 다음 버튼 (SafeAreaView 안쪽에 배치) */}
            <View style={styles.pillRegConfirmBottonContainer}>
              <TouchableOpacity
                style={[
                  styles.pillRegConfirmBotton,
                  !pillRegName.trim() && styles.pillRegConfirmBottonDisable, // 입력값이 없거나 공백일 때 비활성화 스타일 적용
                ]}
                activeOpacity={0.8}
                disabled={!pillRegName.trim()} // medicineName.trim()이 빈 문자열이면 버튼 터치 비활성화
                onPress={pillRegConfirmBottonClick}>
                <Text style={styles.pillRegConfirmBottonText}>확인</Text>
              </TouchableOpacity>
            </View>
          {/* </KeyboardAvoidingView> */}

          {/* 약 복용 횟수 선택 바a텀시트 */}
          {/* <Modal
            animationType="fade"
            transparent={true}
            visible={takeFeqSheetVisible}
            onRequestClose={() => setSheetVisible(false)}
            onShow={() => {
              // 설정된 횟수로 휠 스크롤 피커 시작 설정
              const targetIndex = 10 + (tempDoseCount - 1);
              flatListRef.current?.scrollToIndex({
                index: targetIndex,
                animated: false,
              });
            }}> */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={pillTakeFreqModalVisible}
            onRequestClose={() => setPillTakeFreqModalVisible(false)}
            onShow={() => {
              // 10 대신 NUMBERS.length(5)를 더해 중앙 세트로 위치 맞춤
              const targetIndex = takeFreqArray.length + (takeFreq - 1);
              flatListRef.current?.scrollToIndex({
                index: targetIndex,
                animated: false,
              });
            }}>
            <View style={styles.sheetOverlay}>
              {/* 어두운 배경 클릭 시 바텀시트 닫기 */}
              <TouchableOpacity 
                style={{ flex: 1 }} 
                activeOpacity={1} 
                onPress={() => setPillTakeFreqModalVisible(false)} 
              />

              {/* 바텀시트 본체 */}
              <View style={styles.sheetContainer}>
                {/* 닫기 x 버튼 */}
                <TouchableOpacity 
                  style={styles.sheetCloseButton} 
                  onPress={() => setPillTakeFreqModalVisible(false)}
                >
                  <Ionicons name="close" size={28} color="blue" />
                </TouchableOpacity>

                <Text style={styles.sheetTitle}>하루에 몇번 복용하시나요?</Text>

                {/* 사진 스타일 휠 스크롤 피커 영역 */}
                <View style={styles.pickerWrapper}>
                  {/* 중앙 선택 영역 가로선 */}
                  <View style={styles.selectionOverlay} pointerEvents="none" />

                  <FlatList
                    ref={flatListRef}
                    data={takeFreqLoop}
                    keyExtractor={(_, index) => index.toString()}
                    windowSize={5}                   // 화면 밖 화면을 그려두는 범위를 최소화
                    maxToRenderPerBatch={5}          // 한 번에 렌더링할 아이템 수를 5개로 제한
                    removeClippedSubviews={Platform.OS === 'android'} // 안드로이드 화면 밖 뷰
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    //onScroll={handleScrollEnd} // 스크롤 중에도 실시간 감지
                    //scrollEventThrottle={16} // 16ms 마다 촘촘하게 스크롤 위치를 추적
                    onScrollEndDrag={handleScrollEnd} // 추가: 손으로 살짝 끌다 놓았을 때 대응
                    onMomentumScrollEnd={handleScrollEnd}
                    contentContainerStyle={{
                      paddingVertical: ITEM_HEIGHT, // 위아래 회색 숫자가 보이도록 여백 지정
                    }}
                    getItemLayout={(_, index) => ({
                      length: ITEM_HEIGHT,
                      offset: ITEM_HEIGHT * index,
                      index,
                    })}
                    renderItem={({ item }) => {
                      const isSelected = item === takeFreq;
                      return (
                        <View style={styles.pickerItem}>
                          <Text
                            style={[
                              styles.pickerItemText,
                              isSelected ? styles.selectedText : styles.unselectedText,
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
                  onPress={takeFreqCfmBtnClk}
                >
                  <Text style={styles.sheetConfirmText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>





{/* 테스트 바텀 시트 */}
<Modal
  animationType="fade"
  transparent={true}
  visible={testSheetVisible}
  onRequestClose={() => setTestSheetVisible(false)}
  onShow={() => {
    // 1. 시간 피커 시작 위치 (첫 번째 세트 0~23 위치)
    const hourParseInt = parseInt(takeHour, 10) || 0;
    const targetIndex = hourParseInt; // 0 + hourParseInt (인덱스 범위: 0 ~ 23)

    firstFlatListRef.current?.scrollToIndex({
      index: targetIndex,
      animated: false,
    });

    // 2. 분 피커 시작 위치 (5개 세트 중 중앙인 2번째 세트 위치)
    const minIndex = minData.indexOf(takeMin) !== -1 ? minData.indexOf(takeMin) : 0;
    const targetIndex2 = minData.length * 2 + minIndex; // 12 + minIndex (인덱스 범위: 12 ~ 17)

    secondFlatListRef.current?.scrollToIndex({
      index: targetIndex2,
      animated: false,
    });
  }}>
  <View style={styles.sheetOverlay}>
    {/* 어두운 배경 클릭 시 바텀시트 닫기 */}
    <TouchableOpacity 
      style={{ flex: 1 }} 
      activeOpacity={1} 
      onPress={() => setTestSheetVisible(false)} 
    />

    {/* 바텀시트 본체 */}
    <View style={styles.sheetContainer}>
      {/* 닫기 x 버튼 */}
      <TouchableOpacity 
        style={styles.sheetCloseButton} 
        onPress={() => setTestSheetVisible(false)}
      >
        <Ionicons name="close" size={28} color="blue" />
      </TouchableOpacity>

      <Text style={styles.sheetTitle}>하루에 몇번 복용하시나요?</Text>

      {/* 사진 스타일 휠 스크롤 피커 영역 */}
      <View style={styles.testPickerWrapper}>
        {/* 중앙 선택 영역 가로선 */}
        <View style={styles.selectionOverlay} pointerEvents="none" />
        {/* 첫번째 피커 */}        
        <FlatList
          ref={firstFlatListRef}
          data={hourLoop}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScroll={takeTmHrPickerStop} // 스크롤 중에도 실시간 감지
          scrollEventThrottle={16} // 16ms 마다 촘촘하게 스크롤 위치를 추적
          onMomentumScrollEnd={takeTmHrPickerStop}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT, // 위아래 회색 숫자가 보이도록 여백 지정
          }}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          style={styles.testPickerColumn}
          renderItem={({ item }) => {
            const isSelected = item === takeHour;
            return (
              <View style={styles.pickerItem}>
                <Text
                  style={[
                    styles.pickerItemText,
                    isSelected ? styles.selectedText : styles.unselectedText,
                  ]}
                >
                  {item}
                </Text>
              </View>
            );
          }}/>
        {/* [추가] 두 피커 중앙 콜론 표시 */}
        <View style={styles.colonContainer} pointerEvents="none">
          <Text style={styles.colonText}>:</Text>
        </View>
{/* 두번째 피커 */}
<FlatList
  ref={secondFlatListRef}
  data={minLoop}
  keyExtractor={(_, index) => `right-${index}`}
  showsVerticalScrollIndicator={false}
  snapToInterval={ITEM_HEIGHT}
  decelerationRate="fast"
  onScroll={handleSecondScrollEnd}
  scrollEventThrottle={16}
  onMomentumScrollEnd={handleSecondScrollEnd}
  contentContainerStyle={{
    paddingVertical: ITEM_HEIGHT,
  }}
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  style={styles.testPickerColumn}
  renderItem={({ item }) => {
    const isSelected = item === takeMin;
    return (
      <View style={styles.pickerItem}>
        <Text
          style={[
            styles.pickerItemText,
            isSelected ? styles.selectedText : styles.unselectedText,
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













{/* <Modal
  animationType="fade"
  transparent={true}
  visible={almTmSheetVisible}
  onRequestClose={() => setTimeSheetVisible(false)}
  onShow={() => {
    const hIndex = 120 + HOURS.indexOf(tempHour);
    const mIndex = 120 + MINUTES.indexOf(tempMinute);
    setTimeout(() => {
      hourFlatListRef.current?.scrollToIndex({ index: hIndex, animated: false });
      minuteFlatListRef.current?.scrollToIndex({ index: mIndex, animated: false });
    }, 10);
  }}>
  <View style={styles.sheetOverlay}>
    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setTimeSheetVisible(false)} />
    <View style={styles.sheetContainer}>
      <TouchableOpacity style={styles.sheetCloseButton} onPress={() => setTimeSheetVisible(false)}>
        <Ionicons name="close" size={28} color="black" />
      </TouchableOpacity>

      <Text style={styles.sheetTitle}>복용 시간을 설정해주세요</Text>

      
      <View style={[styles.testPickerWrapper, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
        
        <View style={styles.selectionOverlay} pointerEvents="none" />

        
        <FlatList
          ref={hourFlatListRef}
          data={LOOP_HOURS}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
            if (LOOP_HOURS[idx] && LOOP_HOURS[idx] !== tempHour) {
              setTempHour(LOOP_HOURS[idx]);
            }
          }}
          getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          style={{ height: ITEM_HEIGHT * 3, flexGrow: 0, width: 80 }}
          renderItem={({ item }) => (
            <View style={styles.pickerItem}>
              <Text style={[styles.pickerItemText, item === tempHour ? styles.selectedText : styles.unselectedText]}>
                {item}
              </Text>
            </View>
          )}
        />

        
        <View style={{ height: ITEM_HEIGHT * 3, justifyContent: 'center', alignItems: 'center', width: 30 }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold' }}>:</Text>
        </View>

        
        <FlatList
          ref={minuteFlatListRef}
          data={LOOP_MINUTES}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
            if (LOOP_MINUTES[idx] && LOOP_MINUTES[idx] !== tempMinute) {
              setTempMinute(LOOP_MINUTES[idx]);
            }
          }}
          getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          style={{ height: ITEM_HEIGHT * 3, flexGrow: 0, width: 80 }}
          renderItem={({ item }) => (
            <View style={styles.pickerItem}>
              <Text style={[styles.pickerItemText, item === tempMinute ? styles.selectedText : styles.unselectedText]}>
                {item}
              </Text>
            </View>
          )}
        />
      </View>

       <TouchableOpacity style={styles.sheetConfirmButton} onPress={confirmTime}>
        <Text style={styles.sheetConfirmText}>확인</Text>
      </TouchableOpacity> 
    </View>
  </View>
</Modal> */}
        </SafeAreaView>
      </Modal>
    </View>

    );
}

const styles = StyleSheet.create({
    
    container: {
        flex: 1, // 전체 화면 높이 채우기
    },
    
    topSection: {
        paddingBottom: 5
    },

    // 왼쪽 캘린더 보기 부분
    leftHeaderIconButton: {
        backgroundColor: '#ebe8e8',
        width: 30,
        height: 30,
        justifyContent: 'center', // 버튼 내부 아이콘 세로 중앙 정렬
        alignItems: 'center',     // 버튼 내부 아이콘 가로 중앙 정렬
        marginTop: 17,
        borderRadius:10
    },

    // 오른쪽 구글 버튼
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
        justifyContent: 'center', // 버튼 내부 아이콘 세로 중앙 정렬
        alignItems: 'center',     // 버튼 내부 아이콘 가로 중앙 정렬
    },

    topDivider: {
        height: 2,
         backgroundColor: '#ebe8e8',
        //backgroundColor: 'red',
        marginBottom: 12,
        marginHorizontal: 15
    },

    fab: {
        position: 'absolute',
        right: 20,              // 오른쪽에서 20px 띄움
        bottom: 20,             // 하단 탭 바 높이에 맞춰 탭 바 위로 띄움 (수치로 높낮이 조절 가능)
        width: 60,              // 버튼 가로 크기
        height: 60,             // 버튼 세로 크기
        borderRadius: 30,       // 완전한 동그라미 모양 (width의 절반)
        backgroundColor: 'gray', // 버튼 배경색 (원하는 색상으로 변경 가능)
        justifyContent: 'center',
        alignItems: 'center'
    },

    fabText: {
    color: 'white',
    fontSize: 50,
    fontWeight: '900', // 가장 두꺼운 글씨 두께
    marginTop: -7,
    marginLeft: 2,     // 텍스트 수평 정렬 미세 조정
  },







//테스트 피커 부분
colonContainer: {
  position: 'absolute',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2, // selectionOverlay(1)보다 위에 뜨도록 설정
},
colonText: {
  fontSize: 28, // 숫자와 어울리는 크기로 조정
  fontWeight: 'bold',
  color: '#000000',
  marginBottom: 4, // 폰트 기본 위치에 따른 수직 정렬 미세 조정
},













  // 풀스크린 모달 스타일
  fullModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  fullModalContent: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
    //gap: 35,
  },

// 섭취 시간 표 전체 테두리 박스
timeTableContainer: {
  borderWidth: 1.5,
  borderColor: '#000000',
  borderRadius: 12,
  marginTop: 10,
  overflow: 'hidden',
},

// 표 내부 행 스타일
timeTableRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#E0E0E0',
},

// 회차 텍스트 스타일
timeTableLabel: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#000000',
},

// 시간 뱃지 스타일
timeBadge: {
  backgroundColor: '#CCCCCC',
  paddingVertical: 6,
  paddingHorizontal: 16,
  borderRadius: 8,
},

timeBadgeText: {
  fontSize: 18,
  fontWeight: '600',
  color: '#000000',
},

  inputRow: {
flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50, // 최소 높이를 보장하여 터치 영역 확보
  },
  labelTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  medicineInput: {
flex: 1,
    marginLeft: 15,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000',
    fontSize: 20,
    paddingVertical: 8,  // 터치 영역을 위아래로 확장
    paddingHorizontal: 5,
    color: '#000',       // 입력 글자색 명시
  },

  countBadge: {
    backgroundColor: '#CCCCCC',
    width: 80,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  countBadgeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },

  pillRegConfirmBotton: {
    backgroundColor: '#000',
    height: 56,
    borderRadius: 16, // 화면 맨 밑에 딱 붙지 않도록 라운딩 처리
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 버튼 비활성화 상태 스타일 추가
  pillRegConfirmBottonDisable: {
    backgroundColor: '#CCCCCC', // 회색 배경으로 처리
  },

  // 다음 버튼을 감싸는 컨테이너 (좌우/하단 여백 확보)
  pillRegConfirmBottonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30, // SafeAreaView 내에서 추가적인 하단 여백
  },

  pillRegConfirmBottonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },


  // 바텀시트 스타일
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
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  pickerWrapper: {
height: ITEM_HEIGHT * 3, // 위 1개, 가운데 1개, 아래 1개 (총 3줄)
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },

  testPickerWrapper: {
height: ITEM_HEIGHT * 3,
  width: '100%',
  flexDirection: 'row', // ★ [수정] vertical(세로)에서 row(가로)로 변경
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  marginVertical: 10,
  },

  // ★ [추가] 두 피커가 가로 화면을 50%씩 반반 차지하도록 설정
testPickerColumn: {
  flex: 1,
  height: ITEM_HEIGHT * 3,
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
  selectionOverlay: {
    // position: 'absolute',
    // top: ITEM_HEIGHT,
    // height: ITEM_HEIGHT,
    // width: '40%',
    // borderTopWidth: 1.5,
    // borderBottomWidth: 1.5,
    // borderColor: '#EFEFEF', // 선택 영역 구분을 위한 연한 회색선
    position: 'absolute',
    top: ITEM_HEIGHT, // 50px 위치에 정확히 오버레이
    height: ITEM_HEIGHT,
    width: '60%', // 두 피커와 콜론을 감싸는 전체 너비
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
  selectedText: {
    fontWeight: 'bold',
    color: '#000000', // 가운데 선택된 숫자 (검은색 두껍게)
  },
  unselectedText: {
    fontWeight: 'normal',
    color: '#CCCCCC', // 위/아래 숫자 (흐린 회색)
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
    fontSize: 22, // 원하시는 크기로 설정
    fontWeight: '500',
    color: '#000000',        
  },

  pillListBottonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20, // 두 회색 버튼 사이의 간격 (안 먹히면 아래 marginHorizontal 활용)
    marginRight:10
  },

  pillListButton: {
    backgroundColor: '#ebe8e8',
    width: 75,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pillListButtonText: {
    fontSize: 18,
    fontWeight: 'bold'
  },

  takeFreqContainer: {
    flexDirection: 'column', // 🔥 가로에서 세로 정렬로 변경
    alignItems: 'center', // 🔥 왼쪽 정렬 (필요시 오른쪽으로 살짝 밀 수 있음)
  },

  // ↑↑↑↑↑ 약 목록 카드 스타일 ↑↑↑↑↑ 약 목록 카드 스타일 ↑↑↑↑↑
  // ↑↑↑↑↑ 약 목록 카드 스타일 ↑↑↑↑↑ 약 목록 카드 스타일 ↑↑↑↑↑

});