package entity

import (
	"gorm.io/gorm"
	"time"
)

type Bookingstore struct {
	gorm.Model

	BookerUserID uint  `json:"booker_user_id" gorm:"index" valid:"required~BookerUserID is required"`
	BookerUser   Users `gorm:"foreignKey:BookerUserID;references:ID"`

	StoreID uint  `json:"store_id" gorm:"index" valid:"required~StoreID is required"`
	Store   Store `gorm:"foreignKey:StoreID;references:ID"`

	ServiceID uint    `json:"service_id" valid:"required~ServiceID is required"`
	Service   Service `gorm:"foreignKey:ServiceID;references:ID"`

	BookingTime string `json:"booking_time" valid:"required~BookingTime is required"`

	Date time.Time `json:"date" valid:"required~Date is required"`

	Status string `json:"status" valid:"in(confirmed|pending|cancelled)~Status must be 'confirmed', 'pending', or 'cancelled'"`

	Notes string `json:"notes" gorm:"type:text"`

	TotalCost float32 `json:"total_cost" valid:"required~TotalCost is required"`

	ContactNum string `json:"contact_num" valid:"required~Contact number is required,matches(^\\d{10}$)~Contact number must be 10 digits"`

	CountPet int `json:"count_pet" valid:"required~CountPet is required"`

	Pets []Pet `gorm:"many2many:booking_pets;joinForeignKey:BookingID;joinReferences:PetID;" json:"pets"`
}
