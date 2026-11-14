import { useReducer } from 'react'
import type { GoogleCalendarEventResponse } from '../calendar/api'
import { parseLine, validateDraft, type EventDraft } from '../parser/parseEvent'

export type CreationState = 'idle' | 'pending' | 'success' | 'failure'
export type DraftState = { creationState: CreationState; error?: string }

type State = {
  text: string
  drafts: EventDraft[]
  selectedIds: Set<string>
  draftStates: Record<string, DraftState>
  message: string | null
}

type Action =
  | { type: 'textChanged'; text: string }
  | { type: 'parsed'; drafts: EventDraft[] }
  | { type: 'draftChanged'; draft: EventDraft }
  | { type: 'selected'; id: string }
  | { type: 'selectAll' }
  | { type: 'deselectAll' }
  | { type: 'removed'; id: string }
  | { type: 'restored'; draft: EventDraft; index?: number }
  | { type: 'creationStarted'; id: string }
  | { type: 'creationSucceeded'; id: string }
  | { type: 'creationFailed'; id: string; error: string }
  | { type: 'message'; message: string | null }

const initialState: State = {
  text: '',
  drafts: [],
  selectedIds: new Set(),
  draftStates: {},
  message: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'textChanged':
      return { ...state, text: action.text, drafts: [], draftStates: {}, message: null }
    case 'parsed': {
      return {
        ...state,
        drafts: action.drafts,
        selectedIds: new Set(action.drafts.filter((draft) => draft.status === 'ready').map((draft) => draft.id)),
        draftStates: {},
        message: action.drafts.length ? 'Review and edit your event drafts.' : 'Add at least one event line.',
      }
    }
    case 'draftChanged':
      return {
        ...state,
        drafts: state.drafts.map((draft) =>
          draft.id === action.draft.id ? validateDraft(action.draft) : draft,
        ),
      }
    case 'selected': {
      const selectedIds = new Set(state.selectedIds)
      if (selectedIds.has(action.id)) selectedIds.delete(action.id)
      else selectedIds.add(action.id)
      return { ...state, selectedIds }
    }
    case 'selectAll': {
      const readyIds = state.drafts
        .filter((draft) => draft.status === 'ready')
        .map((draft) => draft.id)
      return { ...state, selectedIds: new Set(readyIds) }
    }
    case 'deselectAll': {
      return { ...state, selectedIds: new Set() }
    }
    case 'removed':
      return {
        ...state,
        drafts: state.drafts.filter((draft) => draft.id !== action.id),
        selectedIds: new Set([...state.selectedIds].filter((id) => id !== action.id)),
      }
    case 'restored': {
      const drafts = [...state.drafts]
      const index =
        typeof action.index === 'number' && action.index >= 0 && action.index <= drafts.length
          ? action.index
          : drafts.length
      drafts.splice(index, 0, action.draft)
      const selectedIds = new Set(state.selectedIds)
      if (action.draft.status === 'ready') {
        selectedIds.add(action.draft.id)
      }
      return { ...state, drafts, selectedIds }
    }
    case 'creationStarted':
      return { ...state, draftStates: { ...state.draftStates, [action.id]: { creationState: 'pending' } } }
    case 'creationSucceeded':
      return { ...state, draftStates: { ...state.draftStates, [action.id]: { creationState: 'success' } } }
    case 'creationFailed':
      return {
        ...state,
        draftStates: {
          ...state.draftStates,
          [action.id]: { creationState: 'failure', error: action.error },
        },
      }
    case 'message':
      return { ...state, message: action.message }
  }
}

export function useDrafts(
  onCreateEvent?: (draft: EventDraft) => Promise<GoogleCalendarEventResponse>,
) {
  const [state, dispatch] = useReducer(reducer, initialState)

  async function createDraft(draft: EventDraft) {
    if (!onCreateEvent || draft.status === 'blocked') return
    dispatch({ type: 'creationStarted', id: draft.id })
    try {
      await onCreateEvent(draft)
      dispatch({ type: 'creationSucceeded', id: draft.id })
    } catch (error) {
      dispatch({
        type: 'creationFailed',
        id: draft.id,
        error: error instanceof Error ? error.message : 'Unable to save this event.',
      })
    }
  }

  async function createSelectedDrafts() {
    const selectedDrafts = state.drafts.filter(
      (draft) => state.selectedIds.has(draft.id) && draft.status === 'ready',
    )
    if (!selectedDrafts.length) {
      dispatch({ type: 'message', message: 'Select at least one ready event to create.' })
      return
    }
    dispatch({ type: 'message', message: null })
    for (const draft of selectedDrafts) await createDraft(draft)
  }

  return {
    state,
    dispatch,
    parseText: (text = state.text) => dispatch({
      type: 'parsed',
      drafts: text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => parseLine(line)),
    }),
    createDraft,
    createSelectedDrafts,
    selectAll: () => dispatch({ type: 'selectAll' }),
    deselectAll: () => dispatch({ type: 'deselectAll' }),
    restoreDraft: (draft: EventDraft, index?: number) =>
      dispatch({ type: 'restored', draft, index }),
  }
}
