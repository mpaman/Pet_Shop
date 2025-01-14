package entity

import (
	"gorm.io/gorm"
)

type Pet struct {
	gorm.Model

	Name       string  `json:"name" binding:"required"` 
	Breed      string  `json:"breed"`                    
	Age        int     `json:"age" binding:"gte=0"`      
	Gender     string  `json:"gender" binding:"required"` 
	Weight     float64 `json:"weight" binding:"gte=0"`   
	Vaccinated string  `json:"vaccinated"`           // yes or no    

	OwnerID    uint   `json:"owner_id" gorm:"index"` 
	Owner      Users  `gorm:"foreignKey:OwnerID;references:ID" json:"owner"`
	PicturePet string `gorm:"type:longtext" json:"picture_pet"`
}
