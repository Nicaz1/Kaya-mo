import { FocusScreen } from './components/focus/FocusScreen'
import { FriendsScreen } from './components/friends/FriendsScreen'
import { HomeScreen } from './components/home/HomeScreen'
import { QuickCapture } from './components/home/QuickCapture'
import { QuestsScreen } from './components/quests/QuestsScreen'
import { LevelUpWatcher } from './components/shared/LevelUpWatcher'
import { NavBar } from './components/shared/NavBar'
import { SettingsScreen } from './components/shared/SettingsScreen'
import { WaterReminder } from './components/shared/WaterReminder'
import { useThemeSync } from './hooks/useThemeSync'
import { useNavigation } from './state/navigation'
import { useAppState } from './state/store'

function App() {
  const { screen, navigate } = useNavigation()
  const state = useAppState()
  useThemeSync(state.settings.theme)

  return (
    <div className="min-h-dvh pb-20">
      {screen === 'home' && <HomeScreen />}
      {screen === 'quests' && <QuestsScreen />}
      {screen === 'focus' && <FocusScreen />}
      {screen === 'friends' && <FriendsScreen />}
      {screen === 'settings' && <SettingsScreen />}

      {/* Always available, on every screen — capturing a thought should never require navigating first. */}
      <QuickCapture />
      <LevelUpWatcher />
      <WaterReminder />

      <NavBar active={screen} onNavigate={navigate} />
    </div>
  )
}

export default App
