package entity

import (
	"gorm.io/gorm"
	"time"
)

type Bookingstore struct {
	gorm.Model

	BookerUserID uint  `json:"booker_user_id"`
	BookerUser   Users `gorm:"foreignKey:BookerUserID;references:ID"`

	StoreID uint  `json:"store_id"`
	Store   Store `gorm:"foreignKey:StoreID;references:ID"`

	ServiceID uint    `json:"service_id"`
	Service   Service `gorm:"foreignKey:ServiceID;references:ID"`

	Datebooking time.Time `json:"date_booking"`
	Timebooking time.Time `json:"time_booking"`

	Status string `json:"status"` // "pending", "accepted"
}
