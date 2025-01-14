package entity

import (
	"gorm.io/gorm"
)

// alt + 96 “

type Users struct {
	gorm.Model

	FirstName string `json:"first_name" valid:"required~FirstName is required"`
	LastName  string `json:"last_name" valid:"required~LastName is required"`
	Email     string `json:"email" valid:"required~Email is required,email~Email is invalid "`
	Password  string `json:"-"`
	Age       uint8  `json:"age"`
	//เดี๋ยวมาแก้ไข
	RoleID    uint   `json:"role_id"`
	Role      Role   `json:"role" gorm:"foreignKey:RoleID"`
	// Role    string `json:"role"`

	Phone   string `json:"phone" valid:"required~Phone is required,stringlength(10|10)"`
	Address string `json:"address"`
	Profile string `gorm:"type:longtext"`
}
