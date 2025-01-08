package entity

import (
	"gorm.io/gorm"
)

type Servicename struct {
	gorm.Model

	Name string `json:"name"`

	Service []Service `json:"service" gorm:"foreignKey:NameServiceID"`
}
