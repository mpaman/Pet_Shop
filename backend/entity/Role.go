package entity

import (
	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Rolename string `json:"role_name"`
}