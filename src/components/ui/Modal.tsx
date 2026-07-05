"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={cn("relative z-50 w-full max-w-lg rounded-xl bg-white p-6 shadow-lg sm:rounded-2xl", className)}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4 rounded-full" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </Button>
        
        {title && (
          <h2 className="text-lg font-semibold leading-none tracking-tight text-slate-900 mb-2">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm text-slate-500 mb-4">
            {description}
          </p>
        )}
        
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  )
}
