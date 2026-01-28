"use client"

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useRef } from 'react'
import type { IAudience } from '@/lib/types/IAudience'
import type { IRegion } from '@/lib/types/IRegion'
import { analytics } from '@/lib/analytics'
import { AnalyticsEvents } from '@/lib/analytics/events'

/**
 * Custom hook for managing audience and region query parameters
 * This allows any component to read and update the current audience/region selection
 */
export function useAudienceRegionParams(audiences: IAudience[] = [], regions: IRegion[] = []) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Get current selections from URL
  const selectedAudienceName = searchParams.get('audience')
  const selectedRegionName = searchParams.get('region')

  const selectedAudience = selectedAudienceName
    ? audiences.find(a => a.name === selectedAudienceName) || null
    : null

  const selectedRegion = selectedRegionName
    ? regions.find(r => r.name === selectedRegionName) || null
    : null

  // Function to update query params
  const updateParams = useCallback((audienceName: string | null, regionName: string | null) => {
    const params = new URLSearchParams(searchParams)

    if (audienceName) {
      //set the audience to a value that is ONLY alphanumeric and dashes/underscores (no spaces or special characters)
      audienceName = audienceName.toLowerCase().replace(/[^a-zA-Z0-9-_]/g, '')
      params.set('audience', audienceName)
    } else {
      params.delete('audience')
    }

    if (regionName) {
      params.set('region', regionName)
    } else {
      params.delete('region')
    }

    const newUrl = `${pathname}?${params.toString().replaceAll("+", "%20")}`
    router.push(newUrl)
  }, [searchParams, router, pathname])

  // Track previous values for change detection
  const prevAudienceRef = useRef<string | null>(selectedAudienceName)
  const prevRegionRef = useRef<string | null>(selectedRegionName)

  // Helper functions with analytics tracking
  const setAudience = useCallback((audience: IAudience | null) => {
    const newAudienceName = audience?.name || null

    // Track audience change
    if (newAudienceName !== prevAudienceRef.current && analytics.isReady()) {
      analytics.track(AnalyticsEvents.AUDIENCE_CHANGED, {
        personalizationType: 'audience',
        audience: newAudienceName || undefined,
        previousAudience: prevAudienceRef.current || undefined,
        path: pathname,
      })
    }

    prevAudienceRef.current = newAudienceName
    updateParams(newAudienceName, selectedRegionName)
  }, [updateParams, selectedRegionName, pathname])

  const setRegion = useCallback((region: IRegion | null) => {
    const newRegionName = region?.name || null

    // Track region change
    if (newRegionName !== prevRegionRef.current && analytics.isReady()) {
      analytics.track(AnalyticsEvents.REGION_CHANGED, {
        personalizationType: 'region',
        region: newRegionName || undefined,
        previousRegion: prevRegionRef.current || undefined,
        path: pathname,
      })
    }

    prevRegionRef.current = newRegionName
    updateParams(selectedAudienceName, newRegionName)
  }, [updateParams, selectedAudienceName, pathname])

  const clearAll = useCallback(() => {
    // Track audience clear if there was an audience
    if (prevAudienceRef.current && analytics.isReady()) {
      analytics.track(AnalyticsEvents.AUDIENCE_CHANGED, {
        personalizationType: 'audience',
        audience: undefined,
        previousAudience: prevAudienceRef.current,
        path: pathname,
      })
    }
    // Track region clear if there was a region
    if (prevRegionRef.current && analytics.isReady()) {
      analytics.track(AnalyticsEvents.REGION_CHANGED, {
        personalizationType: 'region',
        region: undefined,
        previousRegion: prevRegionRef.current,
        path: pathname,
      })
    }
    // Update refs
    prevAudienceRef.current = null
    prevRegionRef.current = null
    updateParams(null, null)
  }, [updateParams, pathname])

  const clearAudience = useCallback(() => {
    // Track audience clear if there was an audience
    if (prevAudienceRef.current && analytics.isReady()) {
      analytics.track(AnalyticsEvents.AUDIENCE_CHANGED, {
        personalizationType: 'audience',
        audience: undefined,
        previousAudience: prevAudienceRef.current,
        path: pathname,
      })
    }
    prevAudienceRef.current = null
    updateParams(null, selectedRegionName)
  }, [updateParams, selectedRegionName, pathname])

  const clearRegion = useCallback(() => {
    // Track region clear if there was a region
    if (prevRegionRef.current && analytics.isReady()) {
      analytics.track(AnalyticsEvents.REGION_CHANGED, {
        personalizationType: 'region',
        region: undefined,
        previousRegion: prevRegionRef.current,
        path: pathname,
      })
    }
    prevRegionRef.current = null
    updateParams(selectedAudienceName, null)
  }, [updateParams, selectedAudienceName, pathname])

  // Computed values
  const hasSelection = selectedAudience !== null || selectedRegion !== null

  const displayName = (() => {
    if (selectedAudience && selectedRegion) {
      return `${selectedAudience.name} • ${selectedRegion.name}`
    }
    if (selectedAudience) {
      return `${selectedAudience.name} • All Regions`
    }
    if (selectedRegion) {
      return `All Audiences • ${selectedRegion.name}`
    }
    return 'All Audiences • All Regions'
  })()

  return {
    // Current selections
    selectedAudience,
    selectedRegion,
    selectedAudienceName,
    selectedRegionName,

    // Helper functions
    setAudience,
    setRegion,
    updateParams,
    clearAll,
    clearAudience,
    clearRegion,

    // Computed values
    hasSelection,
    displayName,

    // Available options (passed through for convenience)
    audiences,
    regions,
  }
}

/**
 * Server-side utility function to extract audience/region from search params
 * Use this in Server Components or pages to get the current selection
 */
export function getAudienceRegionFromSearchParams(
  searchParams: { [key: string]: string | string[] | undefined },
  audiences: IAudience[] = [],
  regions: IRegion[] = []
) {
  const audienceName = typeof searchParams.audience === 'string' ? searchParams.audience : null
  const regionName = typeof searchParams.region === 'string' ? searchParams.region : null

  const selectedAudience = audienceName
    ? audiences.find(a => a.name === audienceName) || null
    : null

  const selectedRegion = regionName
    ? regions.find(r => r.name === regionName) || null
    : null

  const hasSelection = selectedAudience !== null || selectedRegion !== null

  const displayName = (() => {
    if (selectedAudience && selectedRegion) {
      return `${selectedAudience.name} • ${selectedRegion.name}`
    }
    if (selectedAudience) {
      return `${selectedAudience.name} • All Regions`
    }
    if (selectedRegion) {
      return `All Audiences • ${selectedRegion.name}`
    }
    return 'All Audiences • All Regions'
  })()

  return {
    selectedAudience,
    selectedRegion,
    selectedAudienceName: audienceName,
    selectedRegionName: regionName,
    hasSelection,
    displayName,
  }
}