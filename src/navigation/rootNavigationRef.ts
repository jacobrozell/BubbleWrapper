import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootTabParamList } from './types';

/** Used by overlays (e.g. achievement banner) that sit outside `Tab.Navigator` screens. */
export const rootNavigationRef =
  createNavigationContainerRef<RootTabParamList>();
