// Hook to check the user's subscription plan from Supabase profile
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'

export function useSubscription() {
  const { user } = useAuth()
  const [plan, setPlan] = useState('free') // 'free' | 'pro' | 'seller'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPlan('free')
      setLoading(false)
      return
    }

    async function fetchPlan() {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setPlan(data.plan || 'free')
      }
      setLoading(false)
    }

    fetchPlan()
  }, [user])

  return {
    plan,
    loading,
    isPro: plan === 'pro' || plan === 'seller',
    isFree: plan === 'free',
  }
}
