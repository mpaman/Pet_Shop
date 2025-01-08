package entity

import (
	"gorm.io/gorm"
)

type Pettype struct {
	gorm.Model

	PtName string

	Service []Service `json:"service" gorm:"foreignKey:CategoryPetID"`
}

