import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { loadDiary, type Diary } from './loadDiary'

const DiaryContext = createContext<Diary | null>(null)

export function DiaryProvider({ children }: { children: ReactNode }) {
  const diary = useMemo(() => loadDiary(), [])
  return <DiaryContext.Provider value={diary}>{children}</DiaryContext.Provider>
}

export function useDiary() {
  const diary = useContext(DiaryContext)
  if (!diary) throw new Error('The diary is not ready.')
  return diary
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
