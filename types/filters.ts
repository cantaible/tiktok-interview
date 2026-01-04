/**
 * Type definitions for filter state
 * Implements v2 enhanced filtering requirements (FR-007, FR-008)
 */

export interface FilterState {
  /** Date range filter: [startDate, endDate] in ISO format */
  dateRange: {
    from: string | null;
    to: string | null;
  };
  
  /** Selected news source IDs */
  selectedSources: number[];
  
  /** Selected tag names */
  selectedTags: string[];
  
  /** Timestamp when filters were last updated */
  lastUpdated: string;
}

/**
 * Default/empty filter state
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  dateRange: {
    from: null,
    to: null,
  },
  selectedSources: [],
  selectedTags: [],
  lastUpdated: new Date().toISOString(),
};
