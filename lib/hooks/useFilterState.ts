/**
 * Custom hook for managing filter state with localStorage persistence
 * Implements v2 filter persistence and granular clear requirements (FR-007, FR-008)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { FilterState, DEFAULT_FILTER_STATE } from '@/types/filters';
import { saveFilterState, loadFilterState, clearFilterState as clearStorage } from '@/lib/utils/localStorage';

export function useFilterState() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load filter state from localStorage on mount
  useEffect(() => {
    const saved = loadFilterState();
    if (saved) {
      setFilters(saved);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever filters change (debounced)
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveFilterState(filters);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [filters, isLoaded]);

  /**
   * Update filter state partially
   */
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  /**
   * Clear all filters and reset to default state
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
    clearStorage();
  }, []);

  /**
   * Clear specific filter type
   */
  const clearDateRange = useCallback(() => {
    updateFilters({
      dateRange: { from: null, to: null },
    });
  }, [updateFilters]);

  const clearSources = useCallback(() => {
    updateFilters({
      selectedSources: [],
    });
  }, [updateFilters]);

  const clearTags = useCallback(() => {
    updateFilters({
      selectedTags: [],
    });
  }, [updateFilters]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = 
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null ||
    filters.selectedSources.length > 0 ||
    filters.selectedTags.length > 0;

  return {
    filters,
    updateFilters,
    clearFilters,
    clearDateRange,
    clearSources,
    clearTags,
    hasActiveFilters,
    isLoaded,
  };
}
