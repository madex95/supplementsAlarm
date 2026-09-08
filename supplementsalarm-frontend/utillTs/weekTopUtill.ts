

// 날짜 계산 및 그리기 ↓↓↓↓↓↓↓↓↓
// 날짜 계산 및 그리기 ↓↓↓↓↓↓↓↓↓

import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";


// 오늘 날짜 계산 (YYYY-MM-DD 포맷)
export const today = new Date();
export const todayString = today.toISOString().split('T')[0];

// 날짜 계산
export const getWeekDates = () => {
  const currentDay = today.getDay(); // 0(일) ~ 6(토)
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  // 이번 주 일요일 구하기
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - currentDay);

  return days.map((day, index) => {
    const targetDate = new Date(sunday);
    targetDate.setDate(sunday.getDate() + index);

    const fullDate = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

    return {
      day,                                   // 요일
      date: targetDate.getDate().toString(), // 일자 
      fullDate,                              // 고유 날짜값
    };
  });
};

// 탑 날짜부분 날짜구하기
export  const weekDates = getWeekDates();

// 날짜 계산 및 그리기 ↑↑↑↑↑↑↑↑↑
// 날짜 계산 및 그리기 ↑↑↑↑↑↑↑↑↑





export function useModalAnimation(initialHeight = 350) {
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