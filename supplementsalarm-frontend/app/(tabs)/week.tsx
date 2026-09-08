



import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as weekTopUtill from '../../utillTs/weekTopUtill';
import { useModalAnimation } from '../../utillTs/weekTopUtill';

export default function weekScreen() {


  // 탑 날짜부분 날짜구하기
   const [selectedDate, setSelectedDate] = useState(weekTopUtill.todayString);
  

// [추가] 체크박스 토글 상태 (기본값: true = 체크모양)
  const [isChecked, setIsChecked] = useState(true);

const SERVER_URL = 'http://192.168.0.122:8080/api/test';







// 바텀 시트 모달 세팅
const { modalVisible, setModalVisible, closeModal, translateY } = useModalAnimation(350);


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
      {/* 1. 상단 영역 (50% 높이, 빨간색 배경) */}
      <View style={styles.topSection}>
        {/* 이 안에 윗부분에 들어갈 컴포넌트들을 넣습니다 */}
        <SafeAreaView style={{flexDirection: 'row', justifyContent: 'space-between', paddingBottom: -30}}>
          {/* 왼쪽 영역: View로 감싸서 가로 정렬 */}
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
            <TouchableOpacity style={styles.rightHeaderIconButton} activeOpacity={0.7} onPress={()=>setModalVisible(true)}>
              <Ionicons name="logo-google" size={24} color="black" />
            </TouchableOpacity>






      {/* 바텀 시트 모달 */}
      <Modal
        animationType="none" // 배경 애니메이션을 꺼서 어두운 배경이 즉시 나타나도록 설정
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        {/* 즉시 적용되는 어두운 배경 (클릭 시 닫힘) */}
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={closeModal} 
        />

        {/* 아래에서 위로 올라오는 흰색 바텀 시트 */}
        <Animated.View 
          style={[
            styles.bottomSheet, 
            { transform: [{ translateY }] }
          ]}
        >
          {/* X 닫기 버튼 */}
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={28} color="black" />
          </TouchableOpacity>

          {/* 인사 텍스트 */}
          <Text style={styles.greetingText}>안녕하세요</Text>
        </Animated.View>
      </Modal>

















          </View>
        </SafeAreaView>
        
        {/* 일주일 날짜 부분 */}
        <View style={styles.weekContainer}>
          {weekTopUtill.weekDates.map((item) => {
            const isSelected = item.fullDate === selectedDate;

            return (
              <TouchableOpacity
                key={item.fullDate}
                activeOpacity={0.7}
                onPress={() => setSelectedDate(item.fullDate)}
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

      {/* 2. 하단 영역 (50% 높이, 흰색/기존 배경) */}
      <ScrollView style={styles.bottomSection}>
          {/* <View style={styles.bottomCard}>
            <Text>11</Text>
          </View> */}
          <View style={styles.bottomCard}>
            {/* 타이틀 */}
            <Text style={styles.cardTitle}>멜라토닌</Text>
            
            {/* 구분선 */}
            <View style={styles.divider} />
            
            {/* 체크버튼 및 시간 영역 */}
            <View style={styles.cardContent}>
              <TouchableOpacity 
                style={styles.checkButton} 
                activeOpacity={0.7}
                onPress={() => setIsChecked(!isChecked)}
              >
                <Ionicons 
                  name={isChecked ? "checkmark-sharp" : "close-sharp"} 
                  size={22} 
                  color={isChecked ? "#3b5998" : "#e74c3c"} 
                />
              </TouchableOpacity>
              
              <Text style={styles.timeText}>18:00</Text>
            </View>
         </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 전체 화면 높이 채우기
    //flexDirection: 'column', // 위에서 아래로 세로 배치 (기본값)
  },

  topSection: {
    //flex: 1/3, // 상단 지분
    //backgroundColor: '#ddd6d6', // 빨간색 배경 (#FF0000)
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


  // 일주일 날짜 부분 시작
  // 일주일 날짜 부분 시작
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // 요일들을 균등 간격으로 배치
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10
  },

  dayCard: {
    width: 44,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16, // 둥근 모서리
    gap: 8,           // 요일과 날짜 사이 간격
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
  // 일주일 날짜 부분 끝
  // 일주일 날짜 부분 끝



  // 바텀 시트 부분 시작
  // 바텀 시트 부분 시작
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // 반투명한 검은색 배경
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 350,                 // 사진처럼 넉넉한 높이
    backgroundColor: 'white',
    borderTopLeftRadius: 24,     // 위쪽 모서리 둥글게
    borderTopRightRadius: 24,
    padding: 24,
  },

  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: 60,            // X 버튼과 글씨 사이의 간격
  },
  greetingText: {
    fontSize: 40,                // 사진처럼 큰 글씨
    fontWeight: '400',
    textAlign: 'center',
    color: 'black',
  },
  // 바텀 시트 부분 끝
  // 바텀 시트 부분 끝







  bottomSection: {
    flex: 1, // 하단지분
    //backgroundColor: '#ffffff', // 흰색 배경
    marginTop: 0
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
});