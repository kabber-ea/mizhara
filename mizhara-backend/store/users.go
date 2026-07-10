package store

import (
	"context"
	"fmt"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"

	"github.com/jackc/pgx/v5"
)

func scanUser(row pgx.Row) (*models.User, error) {
	var u models.User
	var addrsJSON []byte
	var resetExpires *time.Time
	err := row.Scan(
		&u.ID, &u.Name, &u.Email, &u.Phone, &u.Password, &u.Role,
		&addrsJSON, &u.ResetPasswordToken, &resetExpires,
		&u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	u.ResetPasswordExpires = resetExpires
	_ = scanJSON(addrsJSON, &u.SavedAddresses)
	return &u, nil
}

func InsertUser(ctx context.Context, u *models.User) error {
	addrs, err := marshalJSON(u.SavedAddresses)
	if err != nil {
		return err
	}
	_, err = lib.DB().Exec(ctx, `
		INSERT INTO users (id, name, email, phone, password, role, saved_addresses, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
	`, u.ID, u.Name, u.Email, u.Phone, u.Password, u.Role, addrs, u.CreatedAt, u.UpdatedAt)
	return err
}

func ReplaceUser(ctx context.Context, u *models.User) error {
	addrs, err := marshalJSON(u.SavedAddresses)
	if err != nil {
		return err
	}
	_, err = lib.DB().Exec(ctx, `
		UPDATE users SET name=$2, email=$3, phone=$4, password=$5, role=$6,
			saved_addresses=$7, reset_password_token=$8, reset_password_expires=$9,
			updated_at=$10
		WHERE id=$1
	`, u.ID, u.Name, u.Email, u.Phone, u.Password, u.Role, addrs,
		nullIfEmpty(u.ResetPasswordToken), u.ResetPasswordExpires, u.UpdatedAt)
	return err
}

func nullIfEmpty(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func FindUserByID(ctx context.Context, id string) (*models.User, error) {
	row := lib.DB().QueryRow(ctx, `
		SELECT id, name, email, phone, password, role, saved_addresses,
			reset_password_token, reset_password_expires, created_at, updated_at
		FROM users WHERE id=$1
	`, id)
	u, err := scanUser(row)
	if isNoRows(err) {
		return nil, nil
	}
	return u, err
}

func FindUserByEmail(ctx context.Context, email string) (*models.User, error) {
	row := lib.DB().QueryRow(ctx, `
		SELECT id, name, email, phone, password, role, saved_addresses,
			reset_password_token, reset_password_expires, created_at, updated_at
		FROM users WHERE LOWER(email)=LOWER($1)
	`, email)
	u, err := scanUser(row)
	if isNoRows(err) {
		return nil, nil
	}
	return u, err
}

func FindUserByPhone(ctx context.Context, phone string) (*models.User, error) {
	row := lib.DB().QueryRow(ctx, `
		SELECT id, name, email, phone, password, role, saved_addresses,
			reset_password_token, reset_password_expires, created_at, updated_at
		FROM users WHERE phone=$1
	`, phone)
	u, err := scanUser(row)
	if isNoRows(err) {
		return nil, nil
	}
	return u, err
}

func FindUserByResetToken(ctx context.Context, tokenHash string) (*models.User, error) {
	row := lib.DB().QueryRow(ctx, `
		SELECT id, name, email, phone, password, role, saved_addresses,
			reset_password_token, reset_password_expires, created_at, updated_at
		FROM users WHERE reset_password_token=$1 AND reset_password_expires > $2
	`, tokenHash, time.Now())
	u, err := scanUser(row)
	if isNoRows(err) {
		return nil, nil
	}
	return u, err
}

func CountUsersByEmail(ctx context.Context, email string) (int64, error) {
	var n int64
	err := lib.DB().QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE LOWER(email)=LOWER($1)`, email).Scan(&n)
	return n, err
}

func CountUsersByPhone(ctx context.Context, phone string) (int64, error) {
	var n int64
	err := lib.DB().QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE phone=$1`, phone).Scan(&n)
	return n, err
}

func CountUsersByPhoneExcluding(ctx context.Context, phone, excludeID string) (int64, error) {
	var n int64
	err := lib.DB().QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE phone=$1 AND id<>$2`, phone, excludeID).Scan(&n)
	return n, err
}

func UpdateUserPasswordReset(ctx context.Context, id, tokenHash string, expires time.Time) error {
	_, err := lib.DB().Exec(ctx, `
		UPDATE users SET reset_password_token=$2, reset_password_expires=$3, updated_at=$4 WHERE id=$1
	`, id, tokenHash, expires, time.Now())
	return err
}

func ClearUserPasswordReset(ctx context.Context, id, hashedPassword string) error {
	_, err := lib.DB().Exec(ctx, `
		UPDATE users SET password=$2, reset_password_token=NULL, reset_password_expires=NULL, updated_at=$3 WHERE id=$1
	`, id, hashedPassword, time.Now())
	return err
}

func CountCustomersSince(ctx context.Context, since time.Time) (int64, error) {
	var n int64
	err := lib.DB().QueryRow(ctx, `
		SELECT COUNT(*) FROM users WHERE role=$1 AND created_at >= $2
	`, models.RoleCustomer, since).Scan(&n)
	return n, err
}

type CustomerListRow struct {
	User       models.User
	OrderCount int
	TotalSpent float64
}

func ListCustomers(ctx context.Context, search string, skip, limit int, sortField string, sortDir int) ([]CustomerListRow, int64, error) {
	where := `WHERE u.role = 'customer'`
	args := []any{}
	argN := 1
	if search != "" {
		where += ` AND (u.name ILIKE $` + itoa(argN) + ` OR u.email ILIKE $` + itoa(argN) + ` OR u.phone ILIKE $` + itoa(argN) + `)`
		args = append(args, "%"+search+"%")
		argN++
	}

	countQ := `SELECT COUNT(*) FROM users WHERE role = 'customer'`
	if search != "" {
		countQ += ` AND (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)`
	}
	var total int64
	if err := lib.DB().QueryRow(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	orderBy := customerOrderBy(sortField, sortDir)
	offsetParam := len(args) + 1
	q := `
		SELECT u.id, u.name, u.email, u.phone, u.password, u.role, u.saved_addresses,
			u.reset_password_token, u.reset_password_expires, u.created_at, u.updated_at,
			COALESCE(s.order_count, 0), COALESCE(s.total_spent, 0)
		FROM users u
		LEFT JOIN (
			SELECT user_id,
				COUNT(*) FILTER (WHERE payment_status = 'paid') AS order_count,
				COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0) AS total_spent
			FROM orders GROUP BY user_id
		) s ON s.user_id = u.id
		` + where + ` ORDER BY ` + orderBy + fmt.Sprintf(` OFFSET $%d LIMIT $%d`, offsetParam, offsetParam+1)
	args = append(args, skip, limit)

	rows, err := lib.DB().Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var out []CustomerListRow
	for rows.Next() {
		var row CustomerListRow
		var addrsJSON []byte
		var resetExpires *time.Time
		if err := rows.Scan(
			&row.User.ID, &row.User.Name, &row.User.Email, &row.User.Phone, &row.User.Password, &row.User.Role,
			&addrsJSON, &row.User.ResetPasswordToken, &resetExpires,
			&row.User.CreatedAt, &row.User.UpdatedAt,
			&row.OrderCount, &row.TotalSpent,
		); err != nil {
			return nil, 0, err
		}
		row.User.ResetPasswordExpires = resetExpires
		_ = scanJSON(addrsJSON, &row.User.SavedAddresses)
		out = append(out, row)
	}
	return out, total, rows.Err()
}

func customerOrderBy(field string, dir int) string {
	dirSQL := "DESC"
	if dir > 0 {
		dirSQL = "ASC"
	}
	switch field {
	case "name":
		return "u.name " + dirSQL
	case "email":
		return "u.email " + dirSQL
	case "phone":
		return "u.phone " + dirSQL
	case "orderCount":
		return "order_count " + dirSQL + ", u.name ASC"
	case "totalSpent":
		return "total_spent " + dirSQL + ", u.name ASC"
	default:
		return "u.created_at " + dirSQL
	}
}

func UserOrderStats(ctx context.Context, userID string) (orderCount int64, totalSpent float64, err error) {
	err = lib.DB().QueryRow(ctx, `
		SELECT COUNT(*) FILTER (WHERE payment_status='paid'),
			COALESCE(SUM(total) FILTER (WHERE payment_status='paid'), 0)
		FROM orders WHERE user_id=$1
	`, userID).Scan(&orderCount, &totalSpent)
	return
}
