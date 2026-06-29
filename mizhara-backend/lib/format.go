package lib

import (
	"math"
)

func ToPaise(amount float64) int64 {
	return int64(math.Round(amount * 100))
}
