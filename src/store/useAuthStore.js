import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { toAuthEmail } from '../lib/utils'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,
      initialized: false,

      initAuth: async () => {
        set({ loading: true })
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await get().fetchProfile(session.user)
        }
        set({ loading: false, initialized: true })

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

        // 1. Check username uniqueness (public read, no auth needed)
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.toLowerCase())
          .maybeSingle()

        if (existing) {
          set({ loading: false })
          return { error: { message: 'Username already taken. Please choose another.' } }
        }

        // 2. Sign up with Supabase Auth.
        //    The DB trigger handle_new_user() auto-creates the profile row.
        //    Username is passed via options.data so the trigger can read it.
        const email = toAuthEmail(username)
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pin,
          options: {
            data: { username: username.toLowerCase() },
          },
        })

        if (error) {
          set({ loading: false })
          return { error }
        }

        // 3. With email confirmation DISABLED, signUp() returns a live session.
        //    Poll briefly for the trigger-created profile.
        if (data.session) {
          let profile = null
          for (let i = 0; i < 6; i++) {
            await new Promise((r) => setTimeout(r, 400))
            const { data: p } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle()
            if (p) { profile = p; break }
          }

          if (profile) {
            set({ user: data.user, profile, loading: false })
            return { error: null }
          }

          // Fallback: trigger didn't fire — create profile manually
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

          const role = (count ?? 0) <= 1 ? 'admin' : 'user'

          const { error: pErr } = await supabase
            .from('profiles')
            .insert({ id: data.user.id, username: username.toLowerCase(), role })

          if (pErr) {
            set({ loading: false })
            return { error: { message: `Profile creation failed: ${pErr.message}` } }
          }

          await get().fetchProfile(data.user)
          set({ loading: false })
          return { error: null }
        }

        // No session = email confirmation is still ON in Supabase dashboard
        set({ loading: false })
        return {
          error: {
            message:
              'Setup required: Go to your Supabase project → Authentication → Email → ' +
              'turn OFF "Enable email confirmations", then try again.',
          },
        }
      },

      login: async (username, pin) => {
        set({ loading: true })
        const email = toAuthEmail(username)
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pin,
        })

        if (error) {
          set({ loading: false })
          const msg = error.message.toLowerCase()
          if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
            return { error: { message: 'Incorrect username or PIN.' } }
          }
          if (msg.includes('email not confirmed')) {
            return {
              error: {
                message:
                  'Setup required: Disable "Enable email confirmations" in ' +
                  'Supabase → Authentication → Email.',
              },
            }
          }
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
