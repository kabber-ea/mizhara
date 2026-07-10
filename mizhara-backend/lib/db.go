package lib

import (
	"context"
	_ "embed"
	"errors"
	"os"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed schema.sql
var schemaSQL string

var (
	pool *pgxpool.Pool
	once sync.Once
)

func ConnectDB() error {
	var err error
	once.Do(func() {
		dsn := os.Getenv("DATABASE_URL")
		if dsn == "" {
			err = errors.New("DATABASE_URL is required")
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		pool, err = pgxpool.New(ctx, dsn)
		if err != nil {
			return
		}
		if err = pool.Ping(ctx); err != nil {
			return
		}
		if _, err = pool.Exec(ctx, schemaSQL); err != nil {
			return
		}
	})
	return err
}

func DB() *pgxpool.Pool {
	return pool
}
