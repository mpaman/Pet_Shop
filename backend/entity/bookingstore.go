package entity

import (
	"gorm.io/gorm"
	"time"
)

type Bookingstore struct {
	gorm.Model

	BookerUserID uint  `json:"booker_user_id" gorm:"index" binding:"required"`
	BookerUser   Users `gorm:"foreignKey:BookerUserID;references:ID"`

	StoreID uint  `json:"store_id" gorm:"index" binding:"required"`
	Store   Store `gorm:"foreignKey:StoreID;references:ID"`

	ServiceID uint    `json:"service_id" binding:"required"`
	Service   Service `gorm:"foreignKey:ServiceID;references:ID"`

	BookingTime time.Time `json:"booking_time" binding:"required"`
	EndTime     time.Time `json:"end_time"`

	Status string `json:"status" gorm:"type:enum('pending', 'accepted', 'rejected');default:'pending';index" binding:"required"`

	Notes string `json:"notes" gorm:"type:text"`
}
