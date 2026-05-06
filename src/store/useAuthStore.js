import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { toAuthEmail } from '../lib/utils'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,         // Supabase auth user
      profile: null,      // profiles table row
      loading: false,
      initialized: false,

      setLoading: (v) => set({ loading: v }),

      initAuth: async () => {
        set({ loading: true })
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await get().fetchProfile(session.user)
        }
        set({ loading: false, initialized: true })

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            await get().fetchProfile(session.user)
          } else {
            set({ user: null, profile: null })
          }
        })
      },

      fetchProfile: async (authUser) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (!error && data) {
          set({ user: authUser, profile: data })
        }
      },

      signup: async (username, pin) => {
        set({ loading: true })
        const email = toAuthEmail(username)

        // Check username uniqueness
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.toLowerCase())
          .maybeSingle()

        if (existing) {
          set({ loading: false })
          return { error: { message: 'Username already taken' } }
        }

        // Count existing users to determine first-user admin
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        const role = count === 0 ? 'admin' : 'user'

        const { data, error } = await supabase.auth.signUp({ email, password: pin })

        if (error) {
          set({ loading: false })
          return { error }
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: username.toLowerCase(),
            role,
          })

        set({ loading: false })
        if (profileError) return { error: profileError }
        await get().fetchProfile(data.user)
        return { error: null }
      },

      login: async (username, pin) => {
        set({ loading: true })
        const email = toAuthEmail(username)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pin })
        if (error) {
          set({ loading: false })
          return { error }
        }
        await get().fetchProfile(data.user)
        set({ loading: false })
        return { error: null }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
      },

      refreshProfile: async () => {
        const { user } = get()
        if (user) await get().fetchProfile(user)
      },
    }),
    {
      name: 'library-auth',
      partialize: (s) => ({ profile: s.profile }),
    }
  )
)
