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
	// เปิดการเชื่อมต่อฐานข้อมูล
	config.ConnectionDB()
	config.SetupDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())

	// เส้นทางสำหรับการลงทะเบียนและเข้าสู่ระบบ
	r.POST("/signup", users.SignUp)
	r.POST("/signin", users.SignIn)

	router := r.Group("/")
	{
		router.Use(middlewares.Authorizes())

		// เส้นทางสำหรับผู้ใช้
		router.PUT("/user/:id", users.Update)
		router.GET("/users", users.GetAll)
		router.GET("/user/:id", users.Get)
		router.DELETE("/user/:id", users.Delete)
		router.GET("/user/profile", users.GetUserProfile)

		// เส้นทางสำหรับ Bookingstore
		router.POST("/booking", bookingstore.CreateBooking)
		router.GET("/bookingstore/:id", bookingstore.GetBookingByID)
		router.GET("/bookingstores", bookingstore.GetAllBookings)
		router.PUT("/bookingstore/:id", bookingstore.UpdateBookingStatus)
		router.DELETE("/bookingstore/:id", bookingstore.DeleteBooking)

		// เส้นทางสำหรับ Service
		router.POST("/service", service.CreateService)
		router.GET("/service/:id", service.GetStoreServices)

		// เส้นทางสำหรับ Store
		router.POST("/store", store.CreateStore)
		router.GET("/store/:id", store.GetStoreByID)
		router.GET("/stores", store.GetAllStores)
		router.PUT("/store/:id", store.UpdateStore)
		router.DELETE("/store/:id", store.DeleteStore)

		// เส้นทางสำหรับ Storeimage
		router.POST("/storeimage", storeimage.CreateStoreImage)
		router.GET("/storeimages", storeimage.GetStoreImages)
	}

	// เริ่มต้นเซิร์ฟเวอร์
	r.Run("localhost:" + PORT)
}

// Middleware สำหรับจัดการ CORS
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
