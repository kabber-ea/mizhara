package lib

import (
	"context"
	"log"
	"time"

	"mizhara-backend/models"
)

func EnsurePaidOrders() error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	tag, err := DB().Exec(ctx, `
		UPDATE orders SET payment_status = $1, updated_at = $2
		WHERE payment_status <> $1
	`, string(models.PaymentPaid), time.Now())
	if err != nil {
		return err
	}
	if tag.RowsAffected() > 0 {
		log.Printf("marked %d orders as paid", tag.RowsAffected())
	}
	return nil
}
