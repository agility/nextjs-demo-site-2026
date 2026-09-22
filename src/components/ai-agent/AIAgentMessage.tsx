'use client'

import type { UIMessage } from 'ai'
import { UserIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface AIAgentMessageProps {
  message: UIMessage
}

export default function AIAgentMessage({ message }: AIAgentMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <SparklesIcon className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      )}

      <div className={cn(`max-w-[70%]`, isUser ? 'order-first' : '')}>
        <div
          className={cn(`rounded-lg px-4 py-2`, isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
          )}
        >
          <div className="text-sm">
            {message.parts ? message.parts.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return (
                    <div key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                      {part.text}
                    </div>
                  )
                case 'tool-result':
                  // Don't display tool results directly, they're handled internally
                  return null
                default:
                  return (
                    <div key={`${message.id}-${i}`} className="text-xs opacity-75">
                      {JSON.stringify(part, null, 2)}
                    </div>
                  )
              }
            }) : (
              <div className="whitespace-pre-wrap">Message content</div>
            )}
          </div>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </motion.div>
  )
}