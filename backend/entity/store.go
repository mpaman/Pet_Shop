package entity

import (
	"errors"
	"gorm.io/gorm"
)

type Store struct {
	gorm.Model

	UserID       uint    `json:"user_id" gorm:"not null" valid:"required~UserID is required"`
	User         Users   `gorm:"foreignKey:UserID;constraint:onUpdate:CASCADE,onDelete:SET NULL" json:"user"`
	Name         string  `json:"name" valid:"required~Name is required"`
	ProfileImage string  `gorm:"type:longtext" json:"profile_image" valid:"required~Profile image is required"`

	Longitude float64 `json:"longitude" valid:"required~Longitude is required"`
	Latitude  float64 `json:"latitude" valid:"required~Latitude is required"`

	District    string `json:"district" valid:"required~District is required"`
	// ProvinceID	uint	`json:"province_id" gorm:"not null" valid:"required~Store ID is required"`
	// Province	Servicearea `gorm:"foreignKey:StoreID`
	Province    string `json:"province" valid:"required~Province is required"`
	ContactInfo string `json:"contact_info" valid:"required~Contact information is required"`
	Description string `json:"description" valid:"required~Description is required"`
	TimeOpen    string `json:"time_open" valid:"required~Time open is required"`
	TimeClose   string `json:"time_close" valid:"required~Time close is required"`
	Status      string `json:"status" valid:"required~Status is required"`

	Services []Service `gorm:"foreignKey:StoreID;constraint:onDelete:CASCADE" json:"services"`
}


//เช็คเพิ่มเติม
func (s *Store) Validate() error {
	if s.Longitude < -180 || s.Longitude > 180 {
		return errors.New("Longitude must be between -180 and 180")
	}
	if s.Status != "open" && s.Status != "close" && s.Status != "full" {
		return errors.New("Status must be 'open', 'close', or 'full'")
	}
	return nil
}

