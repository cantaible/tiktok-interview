/**
 * localStorage utility for persisting filter state
 * Implements v2 filter persistence requirement (FR-008)
 */

import { FilterState } from '@/types/filters';

export const FILTER_STATE_KEY = 'news-harvester-filter-state';

/**
 * Save filter state to localStorage
 * @param filterState - Current filter state object
 */
export function saveFilterState(filterState: FilterState): void {
  try {
    const serialized = JSON.stringify(filterState);
    localStorage.setItem(FILTER_STATE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save filter state to localStorage:', error);
  }
}

/**
 * Load filter state from localStorage
 * @returns Saved filter state or null if not found/invalid
 */
export function loadFilterState(): FilterState | null {
  try {
    const serialized = localStorage.getItem(FILTER_STATE_KEY);
    if (!serialized) {
      return null;
    }
    
    const parsed = JSON.parse(serialized);
    
    // Validate structure
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    
    return parsed as FilterState;
  } catch (error) {
    console.error('Failed to load filter state from localStorage:', error);
    return null;
  }
}

/**
 * Clear filter state from localStorage
 */
export function clearFilterState(): void {
  try {
    localStorage.removeItem(FILTER_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear filter state from localStorage:', error);
  }
}
