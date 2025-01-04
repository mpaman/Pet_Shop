package entity

import (
	"gorm.io/gorm"
)

type Servicearea struct {
	gorm.Model
	
	SaName	 string `json:"saname"`
}