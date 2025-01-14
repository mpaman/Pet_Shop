package entity

import (
	"errors"
	"gorm.io/gorm"
)

type Service struct {
	gorm.Model

	StoreID       uint    `json:"store_id" gorm:"not null;index" valid:"required~Store ID is required"`
	Store         Store   `gorm:"foreignKey:StoreID;constraint:onUpdate:CASCADE,onDelete:CASCADE" json:"store"`
	NameService   string  `json:"name_service" gorm:"not null" valid:"required~Service name is required"`
	CategoryPetID uint    `json:"categorypet_id" gorm:"not null;index" valid:"required~Pet Category is required"`
	CategoryPet   Pettype `gorm:"foreignKey:CategoryPetID;constraint:onUpdate:CASCADE,onDelete:SET NULL" json:"categorypet"`
	Duration      int     `json:"duration" gorm:"not null;default:30" valid:"required~Duration is required,range(1|1000)~Duration must be at least 1 minute"`
	Price         float32 `json:"price" gorm:"not null" valid:"required~Price is required,range(1|100000)~Price must be greater than 0"`
}

func (service *Service) Validate() error {

	if service.Duration < 1 {
		return errors.New("Duration must be at least 1 minute")
	}
	if service.Price <= 0 {
		return errors.New("Price must be greater than 0")
	}
	return nil
}
