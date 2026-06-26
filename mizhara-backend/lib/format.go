package lib

import (
	"fmt"
	"math"
	"strconv"
)

func FormatINR(amount float64) string {
	return fmt.Sprintf("₹%s", formatIndianNumber(amount))
}

func formatIndianNumber(n float64) string {
	intPart := int64(math.Round(n))
	s := strconv.FormatInt(intPart, 10)
	if len(s) <= 3 {
		return s
	}
	last3 := s[len(s)-3:]
	rest := s[:len(s)-3]
	var result string
	for i, c := range rest {
		if i > 0 && (len(rest)-i)%2 == 0 {
			result += ","
		}
		result += string(c)
	}
	return result + "," + last3
}

func ToPaise(amount float64) int64 {
	return int64(math.Round(amount * 100))
}
