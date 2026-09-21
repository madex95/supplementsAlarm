



import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//import * as weekTopUtill from '../../utillTs/weekTopUtill';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as c from '../../utillTs/commonUtill';
import * as DB from '../../utillTs/tableUtill';

export default function weekScreen() {

  // 로컬 데이터가 저장될 state
  const [localTablePill, setLocalTablePill] = useState<DB.PILL[]>([]);
  const [localTablePillDetail, setLocalTablePillDetail] = useState<DB.PILL_DETAIL[]>([]);
  const [localTablePillTakeLog, setLocalTablePillTakeLog] = useState<DB.PILL_TAKE_LOG[]>([]);

  // 화면에 그려질 카드 리스트 state
  const [pillCardList, setPillCardList] = useState<any[]>([]);


  // 오늘 날짜 DATE타입
  const today = new Date();

  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  
  useFocusEffect(
    useCallback(() => {
      const loadStoredData = async () => {
        try {
          const storedPill = await AsyncStorage.getItem(DB.PILL_KEY);
          const storedPillDetail = await AsyncStorage.getItem(DB.PILL_DETAIL_KEY);
          const storedPillTakeLog = await AsyncStorage.getItem(DB.PILL_TAKE_LOG_KEY);

          const mstData : DB.PILL[] = storedPill ? JSON.parse(storedPill) : [];
          const dtlData : DB.PILL_DETAIL[] = storedPillDetail ? JSON.parse(storedPillDetail) : [];
          const logData : DB.PILL_TAKE_LOG[] = storedPillTakeLog ? JSON.parse(storedPillTakeLog) : [];
          
          const validMstData = mstData.filter((item) => item.DEL_YN === 'N');
          const validDtlData = dtlData.filter((item) => item.DEL_YN === 'N');
          const validLoglData = logData.filter((item) => item.DEL_YN === 'N');

          setLocalTablePill(validMstData);
          setLocalTablePillDetail(validDtlData);
          setLocalTablePillTakeLog(validLoglData);

          const selectedDateYMD = c.getYMD(selectedDate);

          // 선택한 날짜의 로그 데이터 세팅
          const selectedLogs = validLoglData.filter((lItem) => c.getYMD(lItem.P_TK_DT) === selectedDateYMD && lItem.USE_YN === 'Y');

          // 화면에 그릴 카드 객체 생성
          let cardData: any[] = [];

          // 해당 날짜에 복용 로그가 존재하는 경우 true
          if (selectedLogs.length > 0) {

            // 카드 객체 가공
            cardData = selectedLogs.map((logObj) => {

              // 마스터 데이터 세팅 (약 이름 갖고 와야됨)
              const mstObj = validMstData.find((mItem) => mItem.P_UUID === logObj.P_UUID);

              // 데이터 세팅
              return {
                P_UUID: logObj.P_UUID,
                P_TK_TN: logObj.P_TK_TN,
                P_TK_TM: logObj.P_TK_TM,
                P_NM: mstObj?.P_NM,
                P_TK_CHK_YN: logObj.P_TK_CHK_YN || 'N',
              };
            });
          } 
          // 해당 날짜에 복용 로그가 없는 경우 (오늘/미래 또는 로그가 없는 과거)
          else {
            // 디테일 데이터 세팅
            const useDtlData = validDtlData.filter((item) => item.USE_YN === 'Y');

            // 카드 객체 가공
            cardData = useDtlData.filter((dItem) => {
              // 마스터 데이터 세팅 (약 등록일 갖고와야됨)
              const mstObj = validMstData.find((mItem) => mItem.P_UUID === dItem.P_UUID);

              // REG_DT 값 YYYYMMDD로 변경
              const regDateYMD = c.getYMD(mstObj?.REG_DT);

              // true면 map() 진행
              return selectedDateYMD >= regDateYMD;
            }).map((dItem) => {
              // 마스터 데이터 세팅 (약 이름 갖고 와야됨)
              const mstObj = validMstData.find((mItem) => mItem.P_UUID === dItem.P_UUID);

              // 데이터 세팅
              return {
                ...dItem,
                P_NM: mstObj?.P_NM,
                P_TK_CHK_YN: 'N',
              };
            });
          }

          // 시간순 정렬
          cardData.sort((a, b) => (a.P_TK_TM || '').localeCompare(b.P_TK_TM || ''));

          // 카드 리스트 state 반영
          setPillCardList(cardData);
                
        } catch (e) {
          console.error('데이터 불러오기 실패:', e);
        }
      };

      loadStoredData();
    }, [selectedDate])
  );

  const SERVER_URL = 'http://192.168.0.122:8080/api/test';

  
  // 바텀 시트 모달 세팅
  //const { modalVisible, setModalVisible, closeModal, translateY } = useModalAnimation(350);







  // ↓↓↓↓↓ 상단 날짜 부분 ↓↓↓↓↓ 상단 날짜 부분 ↓↓↓↓↓ 상단 날짜 부분 ↓↓↓↓↓
  // ↓↓↓↓↓ 상단 날짜 부분 ↓↓↓↓↓ 상단 날짜 부분 ↓↓↓↓↓ 상단 날짜 부분 ↓↓↓↓↓

  // 날짜 계산
  const getWeekDates = () => {

    const todayObj = new Date(today);
    const currentDay = todayObj.getDay();

    // 원하는 형식으로 날짜 세팅 
    const days = ['금', '토', '일', '월', '화', '수', '목'];

    // 요일 숫자값으로 매핑
    const dayMap: { [key: string]: number } = {
      '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6
    };

    // days의 첫 번째 요일 숫자값 세팅
    const startDayNum = dayMap[days[0]];

    // 오늘 기준으로 '시작 요일'까지 거슬러 올라갈 일수 계산
    const diff = (currentDay - startDayNum + 7) % 7;

    // 주 시작일 설정 (오늘 날짜에서 diff만큼 빼기)
    const startDate = new Date(todayObj);
    startDate.setDate(todayObj.getDate() - diff);

    return days.map((day, index) => {
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + index);

      // YYYY-MM-DD 포맷
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const fullDate = `${yyyy}-${mm}-${dd}`;

      return {
        day,                                   // 요일 
        date: targetDate.getDate().toString(), // 일자 
        fullDate,                              // YYYY-MM-DD
      };
    });
  };

  // ↑↑↑↑↑ 상단 날짜 부분 ↑↑↑↑↑ 상단 날짜 부분 ↑↑↑↑↑ 상단 날짜 부분 ↑↑↑↑↑
  // ↑↑↑↑↑ 상단 날짜 부분 ↑↑↑↑↑ 상단 날짜 부분 ↑↑↑↑↑ 상단 날짜 부분 ↑↑↑↑↑



  // ↓↓↓↓↓ 하단 카드 부분 ↓↓↓↓↓ 하단 카드 부분 ↓↓↓↓↓ 하단 카드 부분 ↓↓↓↓↓
  // ↓↓↓↓↓ 하단 카드 부분 ↓↓↓↓↓ 하단 카드 부분 ↓↓↓↓↓ 하단 카드 부분 ↓↓↓↓↓

  // 알림 모달 visible state
  const [alertModalVisible, setAlertModalVisible] = useState(false);

  // 복용 체크 버튼 클릭 시 실행 함수
  const takeChkBtnClick = async (uuid: string, takeTurn: number) => {
    // take check botton click

    // 선택한 날짜 YYYYMMDD로 변환
    const selectedDateYMD = c.getYMD(selectedDate);

    // 선택한 날짜가 오늘보다 미래인 경우 알림 모달창 띄우기
    if (selectedDateYMD > c.getYMD(c.getDate())) {
      setAlertModalVisible(true);
      return;
    }

    // 선택한 회차의 약 데이터
    const selectCardData = pillCardList.find(
      (item) => item.P_UUID === uuid && item.P_TK_TN === takeTurn
    );

    // 바뀐 체크박스 값
    const status = selectCardData.P_TK_CHK_YN === 'Y' ? 'N' : 'Y';

    // 체크값 바뀐 카드 반영해서 카드 리스트 세팅 
    setPillCardList((prev) =>
      prev.map((item) => {
        if (item.P_UUID === uuid && item.P_TK_TN === takeTurn) {
          return { ...item, P_TK_CHK_YN: status };
        }
        return item;
      })
    );

    // 카드 리스트 중 선택한 UUID의 데이터
    const cardData = pillCardList.filter((item) => item.P_UUID === uuid);

    // 테이블 정보 복사 (state를 직접 수정하지 않기 위해 생성)
    let coppyLogData = [...localTablePillTakeLog];

    // 선택한 약의 모든 회차를 순회
    cardData.forEach((data) => {

      // 로그 테이블에 기존 데이터가 있는지 위치(인덱스) 체크
      const cnt = coppyLogData.findIndex((item) => {
        
        return(
          item.P_UUID === data.P_UUID &&                
          item.P_TK_TN === data.P_TK_TN &&              
          c.getYMD(item.P_TK_DT) === selectedDateYMD && 
          item.DEL_YN === 'N'                           
        )
        
      });
      
      // 순회 중 선택한 회차 일 시 true 아니면 false 세팅
      const takeTurnChk = data.P_TK_TN === takeTurn;

      // findIndex()로 인해 로그테이블에 데이터가 있으면
      if (cnt > -1){
        // 선택한 회차 일 시 true
        if (takeTurnChk){
          coppyLogData[cnt] = {
            ...coppyLogData[cnt],
            P_TK_CHK_YN: status,
            MOD_DT: c.getDate(),
          };
        }
      // findIndex()로 인해 로그테이블에 데이터가 없으면 (-1)
      } else {

        // 새로운 데이터 등록
        coppyLogData.push({
          P_UUID: data.P_UUID,
          P_TK_TN: data.P_TK_TN,
          P_TK_DT: selectedDate,
          P_TK_TM: data.P_TK_TM,
          P_TK_CHK_YN: takeTurnChk ? status : 'N',
          USE_YN: 'Y',
          DEL_YN: 'N',
          REG_DT: c.getDate(),
          MOD_DT: c.getDate(),
          DEL_DT: null
        });
      }
    })

    // 로그 테이블 state 반영
    setLocalTablePillTakeLog(coppyLogData);

    // 로컬에 테이블 반영
    await AsyncStorage.setItem(DB.PILL_TAKE_LOG_KEY, JSON.stringify(coppyLogData));
    
  }

  // ↑↑↑↑↑ 하단 카드 부분 ↑↑↑↑↑ 하단 카드 부분 ↑↑↑↑↑ 하단 카드 부분 ↑↑↑↑↑
  // ↑↑↑↑↑ 하단 카드 부분 ↑↑↑↑↑ 하단 카드 부분 ↑↑↑↑↑ 하단 카드 부분 ↑↑↑↑↑


/*
// 바텀시트
 function useModalAnimation(initialHeight = 350) {
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useRef(new Animated.Value(initialHeight)).current;

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      translateY.setValue(initialHeight);
    }
  }, [modalVisible, initialHeight, translateY]);

  // 닫힐 때 내려가는 애니메이션 포함
  const closeModal = () => {
    Animated.timing(translateY, {
      toValue: initialHeight,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  return {
    modalVisible,
    setModalVisible,
    closeModal,
    translateY,
  };
}
*/





const googleClick = async() => {

    // 스프링 연결
    // fetch(SERVER_URL)
    //   .then(response => {
    //     if (!response.ok) {
    //       throw new Error(`네트워크 응답 에러 (${response.status})`);
    //     }
    //     return response.text(); // 스프링에서 String을 반환하므로 text() 사용 (JSON이면 json())
    //   })
    //   .then(data => {
    //     console.log("서버 응답:", data);
    //     Alert.alert("알림", data);
    //   })
    //   .catch(error => {
    //     console.error("통신 에러:", error);
    //     Alert.alert("에러", "스프링 부트 연결 실패");
    //   });

  };








  return (
    <View style={styles.container}>
      {/* 상단 전체 영역 */}
      <View style={styles.topSection}>
        <SafeAreaView style={{flexDirection: 'row', justifyContent: 'space-between', paddingBottom: -30}}>
          {/* 왼쪽 영역 */}
          <View style={{flexDirection: 'row', alignItems: 'center', gap:10}}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'black', paddingLeft: 25, paddingTop: 15}}>
              캘린더 보기</Text>
            <TouchableOpacity style={styles.leftHeaderIconButton} activeOpacity={0.7}>
            <Ionicons name="calendar-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>
          {/* 오른쪽 영역 */}
          <View style={styles.rightHeader}>
            <TouchableOpacity style={styles.rightHeaderIconButton} activeOpacity={0.7}>
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
        {/* 일주일 날짜 영역 */}
        <View style={styles.weekContainer}>
          {getWeekDates().map((item) => {
            const isSelected = item.fullDate === selectedDate;

            return (
              <TouchableOpacity
                key={item.fullDate}
                activeOpacity={0.7}
                onPress={() => {setSelectedDate(item.fullDate)}}
                style={[
                  styles.dayCard,
                  isSelected && {backgroundColor: '#ebe8e8'},
                ]}>
                <Text style={styles.dayText}>
                  {item.day}
                </Text>
                <Text style={styles.dateText}>
                  {item.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View> 
      {/* 하단 전체 영역 */}
      <ScrollView style={styles.bottomSection}>
        {pillCardList.length === 0 ? (
          /* 등록된 약이 없는 경우 */
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              등록된 약이 없습니다. {"\n"} 약 탭에서 등록해주세요
            </Text>
          </View>
        ) : (
          /* 약 카드 영역 */
          pillCardList.map((item, index) => {
            const isTaken = item.P_TK_CHK_YN === 'Y';
            return (
              <View 
                key={`${item.P_UUID}-${item.P_TK_TN}-${index}`} 
                style={styles.bottomCard}>
                {/* 약 이름 */}
                <Text style={styles.cardTitle}>{item.P_NM}</Text>
                {/* 구분선 */}
                <View style={styles.divider} />
                {/* 하단 영역 */}
                <View style={styles.cardContent}>
                  {/* 복용 체크 버튼 */}
                  <TouchableOpacity 
                    style={styles.checkButton} 
                    activeOpacity={0.7}
                    onPress={() => takeChkBtnClick(item.P_UUID, item.P_TK_TN)}>
                    <Ionicons 
                      name={isTaken ? "checkmark-sharp" : "close-sharp"} 
                      size={22} 
                      color={isTaken ? "#3b5998" : "#e74c3c"} 
                    />
                  </TouchableOpacity>
                  {/* 복용 시간 */}
                  <Text style={styles.timeText}>{item.P_TK_TM}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>


      {/*****************************************************************/} 
      {/*****************************************************************/}    
      {/***** 모달 영역 시작 *********************************************/}
      {/*****************************************************************/}    
      {/*****************************************************************/}

      {/* 알림 모달 영역 */}
      <Modal
        transparent={true}
        visible={alertModalVisible}
        animationType="fade"
        onRequestClose={() => setAlertModalVisible(false)}>
        <View style={styles.alertModalOverlay}>
          {/* 바깥 배경 누를 시 모달 닫기 */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setAlertModalVisible(false)}/>
          {/* 모달 본문 영역 */}
          <View style={styles.alertModalContents}>
            <Text style={styles.alertModalTitle}>알림</Text>
            <Text style={styles.alertModalText}>아직 오지 않은 날입니다.</Text>
            <View style={styles.alertModalButtonContainer}>
              {/* 모달 닫기 확인 버튼 */}
              <TouchableOpacity
                style={styles.alertModalConfirmButton}
                activeOpacity={0.8}
                onPress={() => setAlertModalVisible(false)}>
                <Text style={styles.alertModalConfirmText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>

    //{/* 업로드/다운로드 모달 */}
    // <Modal
    //   animationType="none" 
    //   transparent={true}
    //   visible={modalVisible}
    //   onRequestClose={closeModal}>
    //   <TouchableOpacity 
    //     style={styles.overlay} 
    //     activeOpacity={1} 
    //     onPress={closeModal} />
    //   <Animated.View 
    //     style={[
    //       styles.bottomSheet, 
    //       { transform: [{ translateY }] }
    //     ]}>
    //     <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
    //       <Ionicons name="close" size={28} color="black" />
    //     </TouchableOpacity>
    //     <Text style={styles.greetingText}>업로드/다운로드 모달</Text>
    //   </Animated.View>
    // </Modal>
  );
}













const styles = StyleSheet.create({
  container: {
    flex: 1, 
  },

  topSection: {
    paddingBottom: 5
  },

  leftHeaderIconButton: {
    backgroundColor: '#ebe8e8',
    width: 30,
    height: 30,
    justifyContent: 'center', 
    alignItems: 'center',    
    marginTop: 17,
    borderRadius:10
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


  // ↓↓↓↓↓ 상단 일주일 날짜 영역 ↓↓↓↓↓ 상단 일주일 날짜 영역 ↓↓↓↓↓ 
  // ↓↓↓↓↓ 상단 일주일 날짜 영역 ↓↓↓↓↓ 상단 일주일 날짜 영역 ↓↓↓↓↓ 
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10
  },

  dayCard: {
    width: 44,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16, 
    gap: 8,           
  },

  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },

  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  // ↑↑↑↑↑ 상단 일주일 날짜 영역  ↑↑↑↑↑ 상단 일주일 날짜 영역 ↑↑↑↑↑
  // ↑↑↑↑↑ 상단 일주일 날짜 영역  ↑↑↑↑↑ 상단 일주일 날짜 영역 ↑↑↑↑↑



  // ↓↓↓↓↓ 복용 약 목록 카드 영역  ↓↓↓↓↓ 복용 약 목록 카드 영역 ↓↓↓↓↓
  // ↓↓↓↓↓ 복용 약 목록 카드 영역  ↓↓↓↓↓ 복용 약 목록 카드 영역 ↓↓↓↓↓
  bottomSection: {
    flex: 1, 
    marginTop: 0
  },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },

  emptyText: {
    fontSize: 18,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 26,
  },

  bottomCard: {
      backgroundColor: 'white', 
      height: 120,
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

  divider: {
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

  checkButton: {
    backgroundColor: '#ebe8e8',
    width: 65,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  timeText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#000000',
  },
  // ↑↑↑↑↑ 복용 약 목록 카드 영역  ↑↑↑↑↑ 복용 약 목록 카드 영역 ↑↑↑↑↑
  // ↑↑↑↑↑ 복용 약 목록 카드 영역  ↑↑↑↑↑ 복용 약 목록 카드 영역 ↑↑↑↑↑



  // ↓↓↓↓↓ 알림 모달 영역 ↓↓↓↓↓ 알림 모달 영역 ↓↓↓↓↓
  // ↓↓↓↓↓ 알림 모달 영역 ↓↓↓↓↓ 알림 모달 영역 ↓↓↓↓↓
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
  // ↑↑↑↑↑ 알림 모달 영역 ↑↑↑↑↑ 알림 모달 영역 ↑↑↑↑↑
  // ↑↑↑↑↑ 알림 모달 영역 ↑↑↑↑↑ 알림 모달 영역 ↑↑↑↑↑



  // ↓↓↓↓↓ 업로드/다운로드 바텀시트 ↓↓↓↓↓ 업로드/다운로드 바텀시트 ↓↓↓↓↓
  // ↓↓↓↓↓ 업로드/다운로드 바텀시트 ↓↓↓↓↓ 업로드/다운로드 바텀시트 ↓↓↓↓↓
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 350,                 
    backgroundColor: 'white',
    borderTopLeftRadius: 24,     
    borderTopRightRadius: 24,
    padding: 24,
  },

  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: 60,            
  },
  greetingText: {
    fontSize: 40,                
    fontWeight: '400',
    textAlign: 'center',
    color: 'black',
  },
  // ↑↑↑↑↑ 업로드/다운로드 바텀시트 ↑↑↑↑↑ 업로드/다운로드 바텀시트 ↑↑↑↑↑
  // ↑↑↑↑↑ 업로드/다운로드 바텀시트 ↑↑↑↑↑ 업로드/다운로드 바텀시트 ↑↑↑↑↑
});