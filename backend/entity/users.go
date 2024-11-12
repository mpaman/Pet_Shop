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
	Role      string `json:"role"`      
	Address   string `json:"address"`
	Profile   string `gorm:"type:longtext"`
}