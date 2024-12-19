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

	BookingTime string `json:"booking_time"`

	Date time.Time `json:"date" binding:"required"`

	Status string `json:"status"`

	Notes string `json:"notes" gorm:"type:text"`

	TotalCost  int `json:"total_cost"`

	ContactNum string `json:"contact_number" binding:"-"`

	CountPet int `json:"count_pet" binding:"required"` // เพิ่ม CountPet
	
}

