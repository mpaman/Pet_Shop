package users

import (
	"errors"

	"net/http"


	"github.com/gin-gonic/gin"

	"golang.org/x/crypto/bcrypt"

	"gorm.io/gorm"


	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
	"github.com/mpaman/petshop/services"
)

type (
	Authen struct {
		Email string `json:"email"`

		Password string `json:"password"`
	}

	signUp struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Password  string `json:"password"`
		Age       uint8  `json:"age"`
		Role    string `json:"role"`
		Address string `json:"address"`
		Profile string `json:"profile"`
	}
)

func SignUp(c *gin.Context) {

	var payload signUp

	// Bind JSON payload to the struct

	if err := c.ShouldBindJSON(&payload); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}

	db := config.DB()

	var userCheck entity.Users

	// Check if the user with the provided email already exists

	result := db.Where("email = ?", payload.Email).First(&userCheck)
//คำสั่ง result := db.Where("email = ?", payload.Email).First(&userCheck) ใช้เพื่อค้นหาข้อมูลผู้ใช้ในตาราง Users โดยใช้ อีเมล ที่ได้รับจาก payload.Email
	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
//โค้ดส่วนนี้ตรวจสอบว่ามีข้อผิดพลาดเกิดขึ้นระหว่างการค้นหาหรือไม่
		// If there's a database error other than "record not found"

		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})

		return

	}

	if userCheck.ID != 0 {

		// If the user with the provided email already exists

		c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})

		return

	}

	// Hash the user's password

	hashedPassword, _ := config.HashPassword(payload.Password)

	// Create a new user

	user := entity.Users{
		FirstName: payload.FirstName,
		LastName:  payload.LastName,
		Email:     payload.Email,
		Age:       payload.Age,
		Password:  hashedPassword,
		Role:      payload.Role,
		Address:   payload.Address,
		Profile:   payload.Profile,
	}

	// Save the user to the database

	if err := db.Create(&user).Error; err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}

	c.JSON(http.StatusCreated, gin.H{"message": "Sign-up successful"})

}

func SignIn(c *gin.Context) {
//การเข้าสู่ระบบ (Sign In) ของผู้ใช้ โดยการตรวจสอบอีเมลและรหัสผ่านที่ผู้ใช้กรอกเข้ามา หากถูกต้อง 
//จะสร้าง JWT Token เพื่อใช้ในกระบวนการยืนยันตัวตนในอนาคต และส่งข้อมูล JWT Token กลับไปยังผู้ใช้
	var payload Authen

	var user entity.Users

	if err := c.ShouldBindJSON(&payload); err != nil {
//ใช้คำสั่ง c.ShouldBindJSON(&payload) เพื่อดึงข้อมูลที่ส่งเข้ามาทาง JSON และเก็บไว้ในโครงสร้าง Authen
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}

	// ค้นหา user ด้วย Username ที่ผู้ใช้กรอกเข้ามา

	if err := config.DB().Raw("SELECT * FROM users WHERE email = ?", payload.Email).Scan(&user).Error; err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}

	// ตรวจสอบรหัสผ่าน

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password))

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": "password is incerrect"})

		return

	}

	jwtWrapper := services.JwtWrapper{

		SecretKey: "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",

		Issuer: "AuthService",

		ExpirationHours: 24,
	}
//กำหนดค่าในโครงสร้าง jwtWrapper ซึ่งใช้สำหรับสร้าง JWT Token โดยมี SecretKey ที่ใช้เข้ารหัส, Issuer (ผู้ที่ออก Token), และระยะเวลาหมดอายุของ Token (24 ชั่วโมง)
	signedToken, err := jwtWrapper.GenerateToken(user.Email)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": "error signing token"})

		return

	}

	c.JSON(http.StatusOK, gin.H{"token_type": "Bearer", "token": signedToken, "id": user.ID})
}