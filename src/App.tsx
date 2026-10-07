import { motion } from 'framer-motion'
import { FocusScreen } from './components/focus/FocusScreen'
import { FriendsScreen } from './components/friends/FriendsScreen'
import { HomeScreen } from './components/home/HomeScreen'
import { QuickCapture } from './components/home/QuickCapture'
import { QuestsScreen } from './components/quests/QuestsScreen'
import { CloudSyncManager } from './components/shared/CloudSyncManager'
import { LevelUpWatcher } from './components/shared/LevelUpWatcher'
import { NavBar } from './components/shared/NavBar'
import { SettingsScreen } from './components/shared/SettingsScreen'
import { WaterReminder } from './components/shared/WaterReminder'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useThemeSync } from './hooks/useThemeSync'
import { useNavigation } from './state/navigation'
import { useAppState } from './state/store'

function App() {
  const { screen, navigate } = useNavigation()
  const state = useAppState()
  const reducedMotion = useReducedMotion()
  useThemeSync(state.settings.theme)

  return (
    <div className="min-h-dvh pb-20">
      <motion.div
        key={screen}
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
      >
        {screen === 'home' && <HomeScreen />}
        {screen === 'quests' && <QuestsScreen />}
        {screen === 'focus' && <FocusScreen />}
        {screen === 'friends' && <FriendsScreen />}
        {screen === 'settings' && <SettingsScreen />}
      </motion.div>

      {/* Always available, on every screen — capturing a thought should never require navigating first. */}
      <QuickCapture />
      <LevelUpWatcher />
      <WaterReminder />
      <CloudSyncManager />

      <NavBar active={screen} onNavigate={navigate} />
    </div>
  )
}

export default App
