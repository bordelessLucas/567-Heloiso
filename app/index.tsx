import { Redirect } from 'expo-router';

/** Entry: UI preview starts at Login (auth wiring comes after layout approval). */
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
