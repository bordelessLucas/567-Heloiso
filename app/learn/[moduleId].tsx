import { useLocalSearchParams } from 'expo-router';

import { LearningModuleScreen } from '@/src/screens/LearningModuleScreen';

export default function LearningModuleRoute() {
  const { moduleId } = useLocalSearchParams<{ moduleId?: string | string[] }>();
  const id = Array.isArray(moduleId) ? moduleId[0] : moduleId;

  return <LearningModuleScreen moduleId={id} />;
}
