package lib

import (
	"context"
	"errors"
	"os"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	client   *mongo.Client
	database *mongo.Database
	once     sync.Once
)

func ConnectDB() error {
	var err error
	once.Do(func() {
		uri := os.Getenv("MONGODB_URI")
		if uri == "" {
			err = errors.New("MONGODB_URI is required")
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		client, err = mongo.Connect(ctx, options.Client().ApplyURI(uri))
		if err != nil {
			return
		}
		err = client.Ping(ctx, nil)
		if err != nil {
			return
		}
		database = client.Database("mizhara")
	})
	return err
}

func DB() *mongo.Database {
	return database
}

func Collection(name string) *mongo.Collection {
	return database.Collection(name)
}

func Users() *mongo.Collection     { return Collection("users") }
func Products() *mongo.Collection  { return Collection("products") }
func Categories() *mongo.Collection { return Collection("categories") }
func Orders() *mongo.Collection    { return Collection("orders") }
