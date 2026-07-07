'use client'

import { SparklesIcon } from '@heroicons/react/24/solid'
import { motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { IAISearchConfigData } from '@/lib/cms-content/getAISearchConfig'

// Lazy-load the AI modal tree (@ai-sdk, ai, streamdown, react-syntax-highlighter, etc.)
// so it is not shipped in the initial bundle on every page. It is only mounted
// once the modal is opened.
const AIModal = dynamic(() => import('./AIModal'), {
  ssr: false,
  loading: () => null,
})

interface FloatingAISearchProps {
  aiConfig: IAISearchConfigData
}

export default function FloatingAISearch({ aiConfig }: FloatingAISearchProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsModalOpen(true)
      }

      // Close modal on Escape
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  return (
    <>
      {/* Floating AI Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          aria-label="Open AI Search"
        >
          <SparklesIcon className="h-6 w-6 text-white" />

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {aiConfig.fullAgentMode ? 'AI Assistant' : 'AI Search'} (⌘K)
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full animate-ping bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>
          <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-blue-600 to-purple-600 opacity-30"></div>
        </motion.button>
      </motion.div>

      {/* AI Modal - only mounted (and its heavy deps loaded) once opened */}
      {isModalOpen && (
        <AIModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          aiConfig={aiConfig}
        />
      )}
    </>
  )
}