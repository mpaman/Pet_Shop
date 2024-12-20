package config

import (
	"fmt"

	"github.com/mpaman/petshop/entity"

	"gorm.io/driver/sqlite"

	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {

	return db

}

func ConnectionDB() {

	database, err := gorm.Open(sqlite.Open("sa.db?cache=shared"), &gorm.Config{})

	if err != nil {

		panic("failed to connect database")

	}

	fmt.Println("connected database")

	db = database

}

func SetupDatabase() {

	db.AutoMigrate(

		&entity.Users{},
		&entity.Bookingstore{},
		&entity.Service{},
		&entity.Store{},
		&entity.StoreImage{},
		&entity.Pet{},
		&entity.PetStoreApplication{},
	)

	hashedPassword, _ := HashPassword("1")

	User := &entity.Users{

		FirstName: "Software",

		LastName: "Analysis",

		Email: "1@gmail.com",

		Age:      80,

		Password: hashedPassword,

		Profile: "data:image/jpeg;base64,/9j/4AAQSkZJRgA",
	}

	db.FirstOrCreate(User, &entity.Users{

		Email: "1@gmail.com",
	})

}
