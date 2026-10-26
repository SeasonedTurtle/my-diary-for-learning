import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Connections } from './Connections'
import { Cover } from './Cover'
import { DiaryProvider } from './diary-context'
import { DiaryLayout } from './DiaryLayout'
import { Guide } from './Guide'
import { TopicView } from './TopicView'

export function App() {
  return (
    <DiaryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Cover />} />
          <Route element={<DiaryLayout />}>
            <Route path="/open/*" element={<TopicView />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/guide" element={<Guide />} />
          </Route>
          <Route path="*" element={<Cover />} />
        </Routes>
      </BrowserRouter>
    </DiaryProvider>
  )
}
