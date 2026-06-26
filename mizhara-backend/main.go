package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"mizhara-backend/lib"
	"mizhara-backend/routes"
)

func main() {
	_ = godotenv.Load()

	if err := lib.ConnectDB(); err != nil {
		log.Fatal("database:", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	r := routes.Setup()
	log.Printf("Mizhara API listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
