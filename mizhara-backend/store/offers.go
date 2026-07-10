package store

import (
	"context"
	"fmt"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"

	"github.com/jackc/pgx/v5"
)

func scanOffer(row pgx.Row) (*models.Offer, error) {
	var o models.Offer
	var productIDsJSON []byte
	var isActive *bool
	var startsAt, endsAt *time.Time
	err := row.Scan(
		&o.ID, &o.Name, &o.Description, &o.Type, &o.Scope,
		&o.Percentage, &o.FixedAmount, &o.MinPurchase, &o.MaxDiscount,
		&o.BuyQuantity, &o.FreeQuantity, &productIDsJSON, &o.Code, &isActive,
		&startsAt, &endsAt, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	o.IsActive = isActive
	o.StartsAt = startsAt
	o.EndsAt = endsAt
	_ = scanJSON(productIDsJSON, &o.ProductIDs)
	return &o, nil
}

const offerCols = `id, name, description, type, scope, percentage, fixed_amount, min_purchase,
	max_discount, buy_quantity, free_quantity, product_ids, code, is_active, starts_at, ends_at, created_at, updated_at`

func InsertOffer(ctx context.Context, o *models.Offer) error {
	ids, _ := marshalJSON(o.ProductIDs)
	_, err := lib.DB().Exec(ctx, `
		INSERT INTO offers (`+offerCols+`)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
	`, o.ID, o.Name, o.Description, o.Type, o.Scope, o.Percentage, o.FixedAmount,
		o.MinPurchase, o.MaxDiscount, o.BuyQuantity, o.FreeQuantity, ids, o.Code, o.IsActive,
		o.StartsAt, o.EndsAt, o.CreatedAt, o.UpdatedAt)
	return err
}

func UpdateOffer(ctx context.Context, o *models.Offer) error {
	ids, _ := marshalJSON(o.ProductIDs)
	tag, err := lib.DB().Exec(ctx, `
		UPDATE offers SET name=$2, description=$3, type=$4, scope=$5, percentage=$6,
			fixed_amount=$7, min_purchase=$8, max_discount=$9, buy_quantity=$10, free_quantity=$11,
			product_ids=$12, code=$13, is_active=$14, starts_at=$15, ends_at=$16, updated_at=$17
		WHERE id=$1
	`, o.ID, o.Name, o.Description, o.Type, o.Scope, o.Percentage, o.FixedAmount,
		o.MinPurchase, o.MaxDiscount, o.BuyQuantity, o.FreeQuantity, ids, o.Code, o.IsActive,
		o.StartsAt, o.EndsAt, o.UpdatedAt)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func DeleteOffer(ctx context.Context, id string) (bool, error) {
	tag, err := lib.DB().Exec(ctx, `DELETE FROM offers WHERE id=$1`, id)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}

func FindOfferByID(ctx context.Context, id string) (*models.Offer, error) {
	row := lib.DB().QueryRow(ctx, `SELECT `+offerCols+` FROM offers WHERE id=$1`, id)
	o, err := scanOffer(row)
	if isNoRows(err) {
		return nil, nil
	}
	return o, err
}

func FindActiveOfferByCode(ctx context.Context, code string) (*models.Offer, error) {
	row := lib.DB().QueryRow(ctx, `
		SELECT `+offerCols+` FROM offers WHERE LOWER(code)=LOWER($1) AND is_active IS DISTINCT FROM FALSE
	`, code)
	o, err := scanOffer(row)
	if isNoRows(err) {
		return nil, nil
	}
	return o, err
}

func FindActiveOfferByID(ctx context.Context, id string) (*models.Offer, error) {
	row := lib.DB().QueryRow(ctx, `
		SELECT `+offerCols+` FROM offers WHERE id=$1 AND is_active IS DISTINCT FROM FALSE
	`, id)
	o, err := scanOffer(row)
	if isNoRows(err) {
		return nil, nil
	}
	return o, err
}

func ListOffers(ctx context.Context, activeOnly bool) ([]models.Offer, error) {
	q := `SELECT ` + offerCols + ` FROM offers`
	if activeOnly {
		q += ` WHERE is_active IS DISTINCT FROM FALSE`
	}
	q += ` ORDER BY created_at DESC`
	rows, err := lib.DB().Query(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Offer
	for rows.Next() {
		o, err := scanOffer(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *o)
	}
	return out, rows.Err()
}

func ListOffersByIDs(ctx context.Context, ids []string) ([]models.Offer, error) {
	if len(ids) == 0 {
		return []models.Offer{}, nil
	}
	rows, err := lib.DB().Query(ctx, `SELECT `+offerCols+` FROM offers WHERE id = ANY($1)`, ids)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Offer
	for rows.Next() {
		o, err := scanOffer(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *o)
	}
	return out, rows.Err()
}

func ListOffersPaginated(ctx context.Context, search string, skip, limit int) ([]models.Offer, int64, int64, int64, error) {
	where := "1=1"
	args := []any{}
	n := 1
	if search != "" {
		where = fmt.Sprintf(`(name ILIKE $%d OR code ILIKE $%d OR description ILIKE $%d)`, n, n, n)
		args = append(args, "%"+search+"%")
		n++
	}
	var total, activeCount, withCode int64
	if err := lib.DB().QueryRow(ctx, `SELECT COUNT(*) FROM offers WHERE `+where, args...).Scan(&total); err != nil {
		return nil, 0, 0, 0, err
	}
	_ = lib.DB().QueryRow(ctx, `SELECT COUNT(*) FROM offers WHERE is_active IS DISTINCT FROM FALSE`).Scan(&activeCount)
	_ = lib.DB().QueryRow(ctx, `SELECT COUNT(*) FROM offers WHERE code IS NOT NULL AND code <> ''`).Scan(&withCode)

	argN := len(args) + 1
	q := `SELECT ` + offerCols + ` FROM offers WHERE ` + where +
		fmt.Sprintf(` ORDER BY created_at DESC OFFSET $%d LIMIT $%d`, argN, argN+1)
	args = append(args, skip, limit)
	rows, err := lib.DB().Query(ctx, q, args...)
	if err != nil {
		return nil, 0, 0, 0, err
	}
	defer rows.Close()
	var out []models.Offer
	for rows.Next() {
		o, err := scanOffer(rows)
		if err != nil {
			return nil, 0, 0, 0, err
		}
		out = append(out, *o)
	}
	return out, total, activeCount, withCode, rows.Err()
}

func ListLiveOffersForProducts(ctx context.Context, productID string, now time.Time) ([]models.Offer, error) {
	rows, err := lib.DB().Query(ctx, `
		SELECT `+offerCols+` FROM offers
		WHERE is_active IS DISTINCT FROM FALSE
		AND (starts_at IS NULL OR starts_at <= $1)
		AND (ends_at IS NULL OR ends_at >= $1)
		AND (scope = 'all' OR product_ids @> to_jsonb(ARRAY[$2]::text[]))
		ORDER BY created_at DESC
	`, now, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Offer
	for rows.Next() {
		o, err := scanOffer(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *o)
	}
	return out, rows.Err()
}

func OfferProductFilter(ctx context.Context, offerIDs []string) ([]string, error) {
	offers, err := ListOffersByIDs(ctx, offerIDs)
	if err != nil {
		return nil, err
	}
	ids := map[string]struct{}{}
	for _, o := range offers {
		if o.Scope == models.OfferScopeAll {
			return nil, nil // no filter
		}
		for _, pid := range o.ProductIDs {
			ids[pid] = struct{}{}
		}
	}
	out := make([]string, 0, len(ids))
	for id := range ids {
		out = append(out, id)
	}
	return out, nil
}
