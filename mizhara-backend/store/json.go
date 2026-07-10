package store

import (
	"encoding/json"
	"strconv"

	"github.com/jackc/pgx/v5"
)

func itoa(n int) string {
	return strconv.Itoa(n)
}

func marshalJSON(v any) ([]byte, error) {
	if v == nil {
		return []byte("[]"), nil
	}
	b, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	if len(b) == 0 || string(b) == "null" {
		return []byte("[]"), nil
	}
	return b, nil
}

func scanJSON(data []byte, dest any) error {
	if len(data) == 0 {
		return nil
	}
	return json.Unmarshal(data, dest)
}

func isNoRows(err error) bool {
	return err == pgx.ErrNoRows
}
