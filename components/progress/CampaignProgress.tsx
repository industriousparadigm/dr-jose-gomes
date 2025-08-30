'use client'

import { useState, useEffect } from 'react'
import { Trophy, Target, Users, Clock, TrendingUp, Zap } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import { motion } from 'framer-motion'
import { Stats } from '@/types'

interface CampaignProgressProps {
  stats: Stats | null
  locale: string
}

interface Milestone {
  amount: number
  label: string
  icon: React.ReactNode
  achieved: boolean
}

export function CampaignProgress({ stats, locale }: CampaignProgressProps) {
  const [currentStats, setCurrentStats] = useState(stats)
  const [isUpdating, setIsUpdating] = useState(false)

  // Poll for updated stats every minute
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsUpdating(true)
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const newStats = await response.json()
          setCurrentStats(newStats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsUpdating(false)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const raised = currentStats?.total_raised || 0
  const goal = currentStats?.goal_amount || 25000
  const donors = currentStats?.donor_count || 0
  const percentage = formatPercentage(raised, goal)

  const milestones: Milestone[] = [
    {
      amount: 5000,
      label: locale === 'pt' ? 'Primeiros passos' : 'First steps',
      icon: <Zap className="w-5 h-5" />,
      achieved: raised >= 5000
    },
    {
      amount: 10000,
      label: locale === 'pt' ? 'Marco importante' : 'Major milestone',
      icon: <Target className="w-5 h-5" />,
      achieved: raised >= 10000
    },
    {
      amount: 15000,
      label: locale === 'pt' ? 'Meio caminho' : 'Halfway there',
      icon: <TrendingUp className="w-5 h-5" />,
      achieved: raised >= 15000
    },
    {
      amount: 20000,
      label: locale === 'pt' ? 'Quase lá' : 'Almost there',
      icon: <Trophy className="w-5 h-5" />,
      achieved: raised >= 20000
    },
    {
      amount: 25000,
      label: locale === 'pt' ? 'Meta alcançada!' : 'Goal reached!',
      icon: <Trophy className="w-5 h-5" />,
      achieved: raised >= 25000
    }
  ]

  const nextMilestone = milestones.find(m => !m.achieved)
  const amountToNext = nextMilestone ? nextMilestone.amount - raised : 0

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {locale === 'pt' ? 'Progresso da Campanha' : 'Campaign Progress'}
          </h2>
          {isUpdating && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5"
            >
              <Clock className="w-5 h-5 text-blue-500" />
            </motion.div>
          )}
        </div>

        {/* Main Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-600">
              {locale === 'pt' ? 'Arrecadado' : 'Raised'}
            </span>
            <span className="font-bold text-gray-900">
              {formatCurrency(raised)} / {formatCurrency(goal)}
            </span>
          </div>
          
          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
            
            {/* Milestone markers */}
            {milestones.map((milestone) => {
              const position = (milestone.amount / goal) * 100
              return (
                <div
                  key={milestone.amount}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${position}%` }}
                >
                  <div className={`w-2 h-8 ${milestone.achieved ? 'bg-green-600' : 'bg-gray-400'}`} />
                </div>
              )
            })}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">{percentage}%</span>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {donors} {locale === 'pt' ? 'apoiadores' : 'supporters'}
              </span>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            {locale === 'pt' ? 'Marcos' : 'Milestones'}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {milestones.map((milestone) => (
              <motion.div
                key={milestone.amount}
                whileHover={{ scale: 1.05 }}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  milestone.achieved
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-1">
                  {milestone.icon}
                  <span className="text-xs font-semibold">
                    {formatCurrency(milestone.amount)}
                  </span>
                  <span className="text-xs">
                    {milestone.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {locale === 'pt' ? 'Próximo marco' : 'Next milestone'}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {nextMilestone.label}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(amountToNext)}
                </p>
                <p className="text-xs text-blue-700">
                  {locale === 'pt' ? 'restantes' : 'to go'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Daily Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(raised / 30)}
            </p>
            <p className="text-xs text-gray-600">
              {locale === 'pt' ? 'Média diária' : 'Daily average'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {donors > 0 ? formatCurrency(raised / donors) : '$0'}
            </p>
            <p className="text-xs text-gray-600">
              {locale === 'pt' ? 'Doação média' : 'Average donation'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              15
            </p>
            <p className="text-xs text-gray-600">
              {locale === 'pt' ? 'Dias restantes' : 'Days remaining'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}