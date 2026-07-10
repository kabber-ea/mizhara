package utils

import (
	"strconv"

	"mizhara-backend/constants"
)

type PaginationParams struct {
	Page   int
	Limit  int
	Skip   int
	Search string
}

type PaginationMeta struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

func ParsePagination(pageStr, limitStr, search string) PaginationParams {
	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)
	if page < 1 {
		page = constants.DefaultPage
	}
	if limit < 1 {
		limit = constants.DefaultLimit
	}
	if limit > constants.MaxLimit {
		limit = constants.MaxLimit
	}
	return PaginationParams{
		Page:   page,
		Limit:  limit,
		Skip:   (page - 1) * limit,
		Search: search,
	}
}

func BuildPaginationMeta(page, limit, total int) PaginationMeta {
	totalPages := 0
	if limit > 0 {
		totalPages = (total + limit - 1) / limit
	}
	return PaginationMeta{Page: page, Limit: limit, Total: total, TotalPages: totalPages}
}
