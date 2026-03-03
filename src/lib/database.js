import { supabase } from './supabase'

// ============ PLAYERS ============

export const getPlayers = async () => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  return { data, error }
}

export const getPlayer = async (id) => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export const createPlayer = async (player) => {
  const { data, error } = await supabase
    .from('players')
    .insert(player)
    .select()
    .single()
  return { data, error }
}

export const updatePlayer = async (id, updates) => {
  const { data, error } = await supabase
    .from('players')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const deletePlayer = async (id) => {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id)
  return { error }
}

// ============ FORMATIONS ============

export const getFormations = async () => {
  const { data, error } = await supabase
    .from('formations')
    .select('*')
    .order('name')
  return { data, error }
}

export const getFormation = async (id) => {
  const { data, error } = await supabase
    .from('formations')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export const createFormation = async (formation) => {
  const { data, error } = await supabase
    .from('formations')
    .insert(formation)
    .select()
    .single()
  return { data, error }
}

export const updateFormation = async (id, updates) => {
  const { data, error } = await supabase
    .from('formations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const deleteFormation = async (id) => {
  const { error } = await supabase
    .from('formations')
    .delete()
    .eq('id', id)
  return { error }
}

// ============ EVENTS ============

export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })
  return { data, error }
}

export const getEvent = async (id) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export const getUpcomingEvents = async () => {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
  return { data, error }
}

export const getPastEvents = async () => {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .lt('date', today)
    .order('date', { ascending: false })
  return { data, error }
}

export const createEvent = async (event) => {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()
  return { data, error }
}

export const updateEvent = async (id, updates) => {
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const deleteEvent = async (id) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
  return { error }
}

// ============ EVENT ATTENDANCE ============

export const addAttendee = async (eventId, playerId) => {
  // First get current attendees
  const { data: event } = await getEvent(eventId)
  if (!event) return { error: 'Event not found' }
  
  const attendees = event.attendees || []
  if (!attendees.includes(playerId)) {
    attendees.push(playerId)
  }
  
  return updateEvent(eventId, { attendees })
}

export const removeAttendee = async (eventId, playerId) => {
  const { data: event } = await getEvent(eventId)
  if (!event) return { error: 'Event not found' }
  
  const attendees = (event.attendees || []).filter(id => id !== playerId)
  return updateEvent(eventId, { attendees })
}

export const confirmAttendee = async (eventId, playerId) => {
  const { data: event } = await getEvent(eventId)
  if (!event) return { error: 'Event not found' }
  
  const confirmedAttendees = event.confirmed_attendees || []
  if (!confirmedAttendees.includes(playerId)) {
    confirmedAttendees.push(playerId)
  }
  
  return updateEvent(eventId, { confirmed_attendees: confirmedAttendees })
}

export const unconfirmAttendee = async (eventId, playerId) => {
  const { data: event } = await getEvent(eventId)
  if (!event) return { error: 'Event not found' }
  
  const confirmedAttendees = (event.confirmed_attendees || []).filter(id => id !== playerId)
  return updateEvent(eventId, { confirmed_attendees: confirmedAttendees })
}

// ============ PROFILES ============

export const getProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name')
  return { data, error }
}

export const updateProfileRole = async (userId, role) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// ============ REAL-TIME SUBSCRIPTIONS ============

export const subscribeToPlayers = (callback) => {
  return supabase
    .channel('players-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, callback)
    .subscribe()
}

export const subscribeToEvents = (callback) => {
  return supabase
    .channel('events-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, callback)
    .subscribe()
}

export const subscribeToFormations = (callback) => {
  return supabase
    .channel('formations-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'formations' }, callback)
    .subscribe()
}
