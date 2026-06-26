package routes

import (
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"mizhara-backend/controllers"
	"mizhara-backend/middleware"
)

func Setup() *gin.Engine {
	if os.Getenv("GO_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.Default()

	origin := os.Getenv("APP_URL")
	if origin == "" {
		origin = "http://localhost:5173"
	}
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{origin, "http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	auth := controllers.AuthController{}
	products := controllers.ProductsController{}
	categories := controllers.CategoriesController{}
	account := controllers.AccountController{}
	payment := controllers.PaymentController{}
	orders := controllers.OrdersController{}
	users := controllers.UsersController{}
	dashboard := controllers.DashboardController{}
	upload := controllers.UploadController{}
	contact := controllers.ContactController{}

	api := r.Group("/api")
	{
		// Auth — public
		api.POST("/auth/login", auth.Login)
		api.POST("/auth/register", auth.Register)
		api.POST("/auth/logout", auth.Logout)
		api.GET("/auth/me", auth.Me)
		api.POST("/auth/forgot-password", auth.ForgotPassword)
		api.POST("/auth/reset-password", auth.ResetPassword)

		// Contact — public
		api.POST("/contact", contact.Submit)

		// Products — role decided in service from session token
		api.GET("/products", middleware.OptionalAuth(), products.List)
		api.GET("/products/featured", products.Featured)
		api.GET("/products/:id", products.GetByID)
		api.GET("/products/:id/related", products.Related)
		api.POST("/products", middleware.AuthRequired(), products.Create)
		api.PUT("/products", middleware.AuthRequired(), products.Update)
		api.DELETE("/products", middleware.AuthRequired(), products.Delete)

		// Categories
		api.GET("/categories", categories.List)
		api.POST("/categories", middleware.AuthRequired(), categories.Create)

		// Account & payment — customer role verified in service
		api.GET("/account/profile", middleware.AuthRequired(), account.GetProfile)
		api.PATCH("/account/profile", middleware.AuthRequired(), account.UpdateProfile)
		api.GET("/account/orders", middleware.AuthRequired(), account.ListOrders)
		api.POST("/payment", middleware.AuthRequired(), payment.Create)
		api.PUT("/payment", middleware.AuthRequired(), payment.Verify)

		// Admin operations — role verified in service from session token
		api.GET("/orders", middleware.AuthRequired(), orders.List)
		api.GET("/orders/:id", middleware.AuthRequired(), orders.GetByID)
		api.PATCH("/orders/:id", middleware.AuthRequired(), orders.Update)
		api.GET("/users", middleware.AuthRequired(), users.ListCustomers)
		api.GET("/dashboard", middleware.AuthRequired(), dashboard.Get)
		api.POST("/upload", middleware.AuthRequired(), upload.Upload)
	}

	return r
}
