/**
 * Toast notification helper hook
 * Provides consistent UX for user feedback across the application
 * @module lib/hooks/useToastHelper
 */

import { useToast } from "@/components/ui/use-toast";

export function useToastHelper() {
  const { toast } = useToast();

  return {
    /**
     * Success notification (green)
     * @param title - Main message
     * @param description - Optional details
     */
    success: (title: string, description?: string) => {
      toast({
        title: `✅ ${title}`,
        description,
        duration: 3000,
      });
    },

    /**
     * Error notification (red)
     * @param title - Main error message
     * @param description - Optional error details
     */
    error: (title: string, description?: string) => {
      toast({
        variant: "destructive",
        title: `❌ ${title}`,
        description,
        duration: 5000,
      });
    },

    /**
     * Warning notification (orange)
     * @param title - Warning message
     * @param description - Optional details
     */
    warning: (title: string, description?: string) => {
      toast({
        title: `⚠️ ${title}`,
        description,
        className: "border-orange-500",
        duration: 4000,
      });
    },

    /**
     * Info notification (blue)
     * @param title - Information message
     * @param description - Optional details
     */
    info: (title: string, description?: string) => {
      toast({
        title: `ℹ️ ${title}`,
        description,
        duration: 3000,
      });
    },

    /**
     * Loading notification (persists until manually dismissed)
     * @param title - Loading message
     * @param description - Optional details
     * @returns Toast dismiss function
     */
    loading: (title: string, description?: string) => {
      return toast({
        title: `⏳ ${title}`,
        description,
        duration: Infinity, // Manual dismiss
      });
    },
  };
}
