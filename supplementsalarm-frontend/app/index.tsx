import { Redirect } from 'expo-router';

export default function Index() {
  // (tabs) 그룹 안의 week 화면으로 이동
  return <Redirect href="/(tabs)/week" />;
}