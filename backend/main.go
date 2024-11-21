package main

import (
	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/controller/bookingstore"
	"github.com/mpaman/petshop/controller/service"
	"github.com/mpaman/petshop/controller/store"
	"github.com/mpaman/petshop/controller/storeimage"
	"github.com/mpaman/petshop/controller/users"
	"github.com/mpaman/petshop/middlewares"
)

const PORT = "8000"

func main() {
	// Initialize database connection
	config.ConnectionDB()
	config.SetupDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())

	// Routes for authentication
	r.POST("/signup", users.SignUp)
	r.POST("/signin", users.SignIn)

	// Authenticated routes
	router := r.Group("/")
	{
		router.Use(middlewares.Authorizes())

		// Routes for users
		router.PUT("/user/:id", users.Update)
		router.GET("/users", users.GetAll)
		router.GET("/user/:id", users.Get)
		router.DELETE("/user/:id", users.Delete)
		router.GET("/user/profile", users.GetUserProfile)

		// Routes for bookingstore
		router.POST("/booking", bookingstore.CreateBookingstore)
		router.GET("/bookingstore/:id", bookingstore.GetBookingstoreByID)
		router.GET("/bookingstores", bookingstore.GetAllBookingstores)
		router.PUT("/bookingstore/:id", bookingstore.UpdateBookingstore)
		router.DELETE("/bookingstore/:id", bookingstore.DeleteBookingstore)

		// Routes for services
		router.POST("/service", service.CreateService)
		router.GET("/service/:id", service.GetServiceByStoreID)
		router.GET("/services", service.GetAll)
		router.PUT("/service/:id", service.UpdateService)
		router.DELETE("/service/:id", store.DeleteStore)

		// Routes for stores
		router.POST("/store", store.CreateStore)
		router.GET("/store/:id", store.GetStoreByID)
		router.GET("/stores", store.GetAllStores)
		router.PUT("/store/:id", store.UpdateStore)
		router.DELETE("/store/:id", store.DeleteStore)

		// Routes for store images
		router.POST("/storeimage", storeimage.CreateStoreImage)
		router.GET("/storeimages/:id", storeimage.GetStoreImages)
		router.GET("/storeimagess", storeimage.GetAll)
		router.PUT("/storeimage/:id", storeimage.UpdateStoreImage)
		router.DELETE("/storeimage/:id", store.DeleteStore)
	}

	// Start the server
	r.Run("localhost:" + PORT)
}

// CORS middleware
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
