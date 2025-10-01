/**
 * Test Configuration
 * Use this for testing with a smaller range
 * Copy these values to constants.js temporarily for testing
 */

// Test with just a few combinations
export const YEARS = [2012, 2013]; // Only 2 years
export const SEMESTERS = [1, 2];
export const LOWER_ID_RESOURCE_LIMIT = 500;
export const TEST_UPPER_LIMIT = 502; // Only 3 IDs (500, 501, 502)
export const MODES = [1, 2]; // Only 2 modes
export const PATHWAYS = [1, 2, 3]; // Only 3 pathways
export const FORM_VERSIONS = [1, 2];

// This gives us: 2 × 2 × 3 × 2 × 3 × 2 = 144 combinations
// Should complete in under 2 minutes

console.log("Test configuration loaded");
console.log("Total test combinations: 2 × 2 × 3 × 2 × 3 × 2 = 144");
