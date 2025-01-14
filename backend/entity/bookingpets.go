package entity

import (
	"gorm.io/gorm"
)

type BookingPets struct {
	gorm.Model
	BookingID uint         `json:"booking_id" gorm:"index"`
	Booking   Bookingstore `gorm:"foreignKey:BookingID;references:ID" json:"booking"`
	PetID     uint         `json:"pet_id" gorm:"index"`
	Pet       Pet          `gorm:"foreignKey:PetID;references:ID" json:"pet"`
}
