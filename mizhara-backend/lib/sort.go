package lib

import "strings"

type SortParams struct {
	Field string
	Dir   int
}

func ParseSort(sortBy, sortDir string, allowed map[string]string, defaultField string) SortParams {
	field, ok := allowed[sortBy]
	if !ok || field == "" {
		field = defaultField
	}
	dir := -1
	if strings.EqualFold(strings.TrimSpace(sortDir), "asc") {
		dir = 1
	}
	return SortParams{Field: field, Dir: dir}
}
