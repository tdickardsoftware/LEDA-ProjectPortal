/**
 * Advanced search query parser for LEDA datatable filtering.
 *
 * Parses a free-text search string into a structured `ParsedSearch` object
 * that supports:
 * - General (full-text) search – passed through to Fuse.js or similar.
 * - Field-specific search using `Field = value`, `Field IN (v1, v2)`, and
 *   reverse `value IN Field` (partial match) syntax.
 * - Compound queries with AND within a group and OR between groups.
 *
 * Exported utilities:
 * - `createColumnMapping`  – builds a lookup from display names / aliases to data keys.
 * - `resolveFieldName`     – normalises a user-typed field name using the mapping.
 * - `parseFieldSearch`     – converts a raw query string to a `ParsedSearch`.
 * - `buildSQLWhereClause`  – generates a parameterised SQL WHERE clause.
 * - `filterDataBySearch`   – applies parsed search to an in-memory array.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface FieldSearch {
	field: string;
	values: string[];
	matchMode: 'exact' | 'in' | 'contains';
}

export interface SearchGroup {
	fieldSearches: FieldSearch[];
	remainingQuery: string;
	operator: 'AND';
}

export interface ParsedSearch {
	type: 'general' | 'field-specific';
	query?: string;
	searchGroups?: SearchGroup[];
	operator?: 'OR';
}

export interface ColumnMapping {
	displayName: string;
	dataKey: string;
	variations: string[];
}

/**
 * Creates a column mapping from display names to data keys
 */
export function createColumnMapping(columns: ColumnMapping[]): Map<string, string> {
	const mapping = new Map<string, string>();
	
	columns.forEach(col => {
		const { displayName, dataKey, variations: providedVariations } = col;
		const variations = new Set<string>();
		
		// Add display name variations if available
		if (displayName && displayName.trim()) {
			const cleanDisplayName = displayName.trim();
			variations.add(cleanDisplayName.toLowerCase());
			variations.add(cleanDisplayName.toLowerCase().replace(/\s+/g, ""));
			variations.add(cleanDisplayName.toLowerCase().replace(/[^a-z0-9]/g, ""));
		}
		
		// Add data key variations
		variations.add(dataKey.toLowerCase());
		variations.add(dataKey); // original case
		
		// Add camelCase variations
		if (dataKey !== dataKey.toLowerCase()) {
			variations.add(dataKey.toLowerCase());
			const underscored = dataKey.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
			variations.add(underscored);
			const spaced = dataKey.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
			variations.add(spaced);
		}
		
		// Add custom provided variations (lowercase them for consistent matching)
		if (providedVariations && Array.isArray(providedVariations)) {
			providedVariations.forEach(variation => {
				if (variation && variation.trim()) {
					variations.add(variation.toLowerCase());
				}
			});
		}
		
		// Add all variations to mapping
		Array.from(variations).forEach(variation => {
			if (variation && variation.trim()) {
				mapping.set(variation, dataKey);
			}
		});
	});
	
	return mapping;
}

/**
 * Resolves a field name to its actual data key using the column mapping
 */
export function resolveFieldName(fieldName: string, columnMapping: Map<string, string>): string {
	const normalized = fieldName.toLowerCase();
	
	// Try exact match first
	if (columnMapping.has(normalized)) {
		return columnMapping.get(normalized)!;
	}
	
	// Try without spaces and special characters
	const cleanName = normalized.replace(/[^a-z0-9]/g, "");
	if (columnMapping.has(cleanName)) {
		return columnMapping.get(cleanName)!;
	}
	
	// Return original if no mapping found
	return fieldName;
}

/**
 * Parses a search query into structured search groups with field-specific and general searches
 */
export function parseFieldSearch(query: string, columnMapping: Map<string, string>): ParsedSearch {
	// Check for field-specific patterns (= or IN)
	const hasFieldPattern = /["']?(\w+|\w+\s+\w+)["']?\s*(=|IN)/.test(query);
	
	if (!hasFieldPattern) {
		return { type: "general", query: query.trim() };
	}

	// Split by OR first (case insensitive)
	const orGroups = query.split(/\s+or\s+/gi);
	
	const searchGroups = orGroups.map(orGroup => {
		// Within each OR group, split by AND
		const andParts = orGroup.split(/\s+and\s+/gi);
		
		const fieldSearches: FieldSearch[] = [];
		let remainingQuery = "";
		
		andParts.forEach(part => {
			// Pattern 1: "Field" = "value" or Field = value (exact match)
			const exactMatchQuoted = part.match(/"([^"]+)"\s*=\s*"([^"]+)"/);
			const exactMatchMixed = part.match(/"([^"]+)"\s*=\s*([^"\s,]+)/);
			const exactMatchUnquoted = part.match(/(\w+)\s*=\s*"([^"]+)"/);
			const exactMatchPlain = part.match(/(\w+)\s*=\s*([^"\s,]+)/);
			
			// Pattern 2: "Field" IN ("value1", "value2") or Field IN (value1, value2) - case insensitive IN
			const inMatchQuoted = part.match(/"([^"]+)"\s+(?:IN|in)\s*\((.+?)\)/i);
			const inMatchUnquoted = part.match(/(\w+)\s+(?:IN|in)\s*\((.+?)\)/i);
			
			// Pattern 3a: ("value1", "value2") IN "Field" or (value1, value2) IN Field (multiple values contains) - case insensitive IN
			const multiReverseInQuoted = part.match(/\((.+?)\)\s+(?:IN|in)\s+"([^"]+)"/i);
			const multiReverseInUnquoted = part.match(/\((.+?)\)\s+(?:IN|in)\s+(\w+)/i);
			
			// Pattern 3b: "value" IN "Field" or value IN Field (single value contains/partial match) - case insensitive IN
			const reverseInQuoted = part.match(/"([^"]+)"\s+(?:IN|in)\s+"([^"]+)"/i);
			const reverseInMixed1 = part.match(/"([^"]+)"\s+(?:IN|in)\s+(\w+)/i);
			const reverseInMixed2 = part.match(/([^"\s,]+)\s+(?:IN|in)\s+"([^"]+)"/i);
			const reverseInUnquoted = part.match(/([^"\s,]+)\s+(?:IN|in)\s+(\w+)/i);
			
			if (exactMatchQuoted || exactMatchMixed || exactMatchUnquoted || exactMatchPlain) {
				// Exact match pattern
				const match = exactMatchQuoted || exactMatchMixed || exactMatchUnquoted || exactMatchPlain;
				const originalField = match![1];
				const resolvedField = resolveFieldName(originalField, columnMapping);
				const value = match![2];
				
				fieldSearches.push({ 
					field: resolvedField, 
					values: [value], 
					matchMode: 'exact' 
				});
			} else if (inMatchQuoted || inMatchUnquoted) {
				// IN operator pattern: Field IN (values)
				const match = inMatchQuoted || inMatchUnquoted;
				const originalField = match![1];
				const resolvedField = resolveFieldName(originalField, columnMapping);
				const valuesPart = match![2];
				
				// Parse comma-separated values
				const values: string[] = [];
				const quotedValuePattern = /"([^"]*)"/g;
				const quotedMatches = [...valuesPart.matchAll(quotedValuePattern)];
				
				if (quotedMatches.length > 0) {
					quotedMatches.forEach(match => {
						values.push(match[1]);
					});
				} else {
					valuesPart.split(',').forEach(v => {
						const trimmed = v.trim();
						if (trimmed) values.push(trimmed);
					});
				}
				
				if (values.length > 0) {
					fieldSearches.push({ 
						field: resolvedField, 
						values, 
						matchMode: 'in' 
					});
				}
			} else if (multiReverseInQuoted || multiReverseInUnquoted) {
				// Multiple values reverse IN: (values) IN Field (partial match for any value)
				const match = multiReverseInQuoted || multiReverseInUnquoted;
				const valuesPart = match![1];
				const originalField = match![2];
				const resolvedField = resolveFieldName(originalField, columnMapping);
				
				// Parse comma-separated values
				const values: string[] = [];
				const quotedValuePattern = /"([^"]*)"/g;
				const quotedMatches = [...valuesPart.matchAll(quotedValuePattern)];
				
				if (quotedMatches.length > 0) {
					quotedMatches.forEach(match => {
						values.push(match[1]);
					});
				} else {
					valuesPart.split(',').forEach(v => {
						const trimmed = v.trim();
						if (trimmed) values.push(trimmed);
					});
				}
				
				if (values.length > 0) {
					fieldSearches.push({ 
						field: resolvedField, 
						values, 
						matchMode: 'contains' 
					});
				}
			} else if (reverseInQuoted || reverseInMixed1 || reverseInMixed2 || reverseInUnquoted) {
				// Reverse IN operator: value IN Field (partial match)
				const match = reverseInQuoted || reverseInMixed1 || reverseInMixed2 || reverseInUnquoted;
				const value = match![1];
				const originalField = match![2];
				const resolvedField = resolveFieldName(originalField, columnMapping);
				
				fieldSearches.push({ 
					field: resolvedField, 
					values: [value], 
					matchMode: 'contains' 
				});
			} else {
				// This part is general search text
				if (part.trim()) {
					remainingQuery += " " + part.trim();
				}
			}
		});
		
		return {
			fieldSearches,
			remainingQuery: remainingQuery.trim(),
			operator: "AND" as const
		};
	});

	return {
		type: "field-specific" as const,
		searchGroups,
		operator: "OR" as const
	};
}

/**
 * Builds a SQL WHERE clause from parsed search
 * Returns { whereClause, params }
 */
export function buildSQLWhereClause(
	parsedSearch: ParsedSearch,
	columnMapping: Map<string, string>,
	tableAlias?: string
): { whereClause: string; params: any[] } {
	if (parsedSearch.type === 'general') {
		// For general search, return empty - let the caller handle it
		return { whereClause: '', params: [] };
	}

	if (!parsedSearch.searchGroups || parsedSearch.searchGroups.length === 0) {
		return { whereClause: '', params: [] };
	}

	const params: any[] = [];
	let paramIndex = 1;
	const prefix = tableAlias ? `${tableAlias}.` : '';

	const orConditions = parsedSearch.searchGroups.map(group => {
		const andConditions: string[] = [];

		group.fieldSearches.forEach(({ field, values, matchMode }) => {
			// Use the mapped column expression if available, otherwise fall back to field with prefix
			const rawColName = columnMapping.has(field) ? columnMapping.get(field)! : null;
			// If the mapped value is already a full SQL expression (contains " or .), use as-is.
			// Otherwise quote it so PostgreSQL preserves the identifier's case (e.g. "fullName" vs fullname).
			const columnName = rawColName !== null
				? (rawColName.includes('"') || rawColName.includes('.') ? rawColName : `${prefix}"${rawColName}"`)
				: `${prefix}"${field}"`;

			switch (matchMode) {
				case 'exact': {
					// Exact match: field = value
					params.push(values[0]);
					andConditions.push(`${columnName} = $${paramIndex++}`);
					break;
				}
				case 'in': {
					// IN operator: field IN (value1, value2, ...)
					const placeholders = values.map(() => `$${paramIndex++}`).join(', ');
					params.push(...values);
					andConditions.push(`${columnName} IN (${placeholders})`);
					break;
				}
				case 'contains': {
					// Contains: field ILIKE '%value%' for each value (OR'd together)
					const orLikes = values.map(() => {
						params.push(`%${values[params.length - paramIndex + 1]}%`);
						return `${columnName} ILIKE $${paramIndex++}`;
					}).join(' OR ');
					andConditions.push(`(${orLikes})`);
					break;
				}
			}
		});

		// Join AND conditions for this group
		return andConditions.length > 0 ? `(${andConditions.join(' AND ')})` : '';
	}).filter(Boolean);

	// Join OR groups
	const whereClause = orConditions.length > 0 ? orConditions.join(' OR ') : '';
	
	return { whereClause, params };
}

/**
 * Filters client-side data based on parsed search
 */
export function filterDataBySearch<T extends Record<string, any>>(
	data: T[],
	parsedSearch: ParsedSearch
): T[] {
	if (parsedSearch.type === 'general') {
		// For general search, caller should use Fuse.js or similar
		return data;
	}

	if (!parsedSearch.searchGroups) {
		return data;
	}

	return data.filter(row => {
		// OR logic: row matches if it satisfies ANY search group
		return parsedSearch.searchGroups!.some(group => {
			// AND logic within group: row must satisfy ALL conditions in the group
			if (group.fieldSearches.length === 0) {
				return true;
			}

			return group.fieldSearches.every(({ field, values, matchMode }) => {
				const cellValue = String(row[field] || "").toLowerCase();
				
				switch (matchMode) {
					case 'exact':
						// Exact match: "Field" = "value"
						return cellValue === values[0].toLowerCase();
						
					case 'in':
						// IN operator: "Field" IN ("value1", "value2")
						return values.some(value => 
							cellValue === value.toLowerCase()
						);
						
					case 'contains':
						// Reverse IN: "value" IN "Field" (partial match)
						// Match if cell value contains ANY of the values
						return values.some(value => 
							cellValue.includes(value.toLowerCase())
						);
						
					default:
						return false;
				}
			});
		});
	});
}
