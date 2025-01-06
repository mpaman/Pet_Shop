package entity

import (
	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Rolename string `json:"role_name"`
	Users    []Users `json:"users" gorm:"foreignKey:RoleID"`
}