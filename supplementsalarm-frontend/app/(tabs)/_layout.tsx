import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native'; // 이미지 삽입용 임포트

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false, // 이거하니까 글자 사라짐
        tabBarStyle: {
              height: 115, 
              paddingBottom: 10,
        },
      }}>
      <Tabs.Screen
        name="week"
        options={{
          tabBarIcon: ({ color , focused }) => (
            <View style = {[styles.viewStyle,{backgroundColor: focused ? 'rgb(240,240,240)' : 'transparent'}]}>
              <Image
                source={require('@/assets/images/layoutWeek.png')}
                style={{ width: 24, height: 24, tintColor: focused ? '#000000' : color }}
                resizeMode="contain"
              />
              <Text style={{fontSize: 12, color: focused ? '#000000' : color}}>
                이번주
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pill"
        options={{
          tabBarIcon: ({ color , focused }) => (
            <View style = {[styles.viewStyle,{backgroundColor: focused ? 'rgb(240,240,240)' : 'transparent'}]}> 
              <Image
                source={require('@/assets/images/layoutPill.png')}
                style={{ width: 24, height: 24, tintColor: focused ? '#000000' : color }}
                resizeMode="contain"
              />
              <Text style={{fontSize: 12, color: focused ? '#000000' : color}}>
                약
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          tabBarIcon: ({color , focused}) => (
            <View style = {[styles.viewStyle,{backgroundColor: focused ? 'rgb(240,240,240)' : 'transparent'}]}> 
              <Image 
                source={require('@/assets/images/layoutStatistics.png')}
                style={{width: 24, height: 24, tintColor: focused ? '#000000' : color}}
                resizeMode='contain'
              />
              <Text style={{fontSize: 12, color: focused ? '#000000' : color}}>
                기록
              </Text>
          </View>
          )
        }}
      /> 
    </Tabs>
  );
}


const styles = StyleSheet.create({

  viewStyle: {
    width: 75,
    height: 55,
    borderRadius: 12,
    //backgroundColor: focused ? 'rgb(240,240,240)' : 'transparent',
    justifyContent : 'center',
    alignItems: 'center',
    marginTop: 40
  }

})