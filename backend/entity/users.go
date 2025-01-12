package entity

import (
	"gorm.io/gorm"
)

type Users struct {
	gorm.Model

	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Password  string `json:"-"`
	Age       uint8  `json:"age"`
	//เดี๋ยวมาแก้ไข
	RoleID    uint   `json:"role_id"`
	Role      Role   `json:"role" gorm:"foreignKey:RoleID"`
	// Role    string `json:"role"`
    
	Phone   string `json:"phone"`
	Address string `json:"address"`
	Profile string `gorm:"type:longtext"`
}