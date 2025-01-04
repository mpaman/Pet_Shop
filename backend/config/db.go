package config

import (
	"fmt"
	"time"

	"github.com/mpaman/petshop/entity"

	"github.com/mpaman/petshop/images"

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

		Age: 80,

		Password: hashedPassword,

		Role: "user",

		Profile: images.EncodeImageToBase64("images/profile/1.png"),
	}

	db.FirstOrCreate(User, &entity.Users{

		Email: "1@gmail.com",
	})
	store1 := entity.Store{
		UserID:       1,
		Name:         "Happy Pet Store",
		ProfileImage: images.EncodeImageToBase64("images/store/store1.jpg"),
		Longitude:    100.523186,
		Latitude:     13.736717,
		District:     "บางรัก",
		Province:     "กรุงเทพมหานคร",
		ContactInfo:  "081-123-4567",
		Description:  "ร้านอุปกรณ์สัตว์เลี้ยงที่มีสินค้าครบครัน",
		TimeOpen:     "09:00",
		TimeClose:    "18:00",
		Status:       "open",
	}

	db.FirstOrCreate(&store1, &entity.Store{Name: "Happy Pet Store"})

	service1 := entity.Service{
		StoreID:     store1.ID,
		NameService: "อาบน้ำและตัดขน",
		CategoryPet: "แมว",
		Duration:    60,
		Price:       300,
	}

	service2 := entity.Service{
		StoreID:     store1.ID,
		NameService: "ตรวจสุขภาพ",
		CategoryPet: "สุนัข",
		Duration:    30,
		Price:       500,
	}

	db.FirstOrCreate(&service1, &entity.Service{StoreID: store1.ID, NameService: "อาบน้ำและตัดขน"})
	db.FirstOrCreate(&service2, &entity.Service{StoreID: store1.ID, NameService: "ตรวจสุขภาพ"})

	storeImage1 := entity.StoreImage{
		ImageURL: images.EncodeImageToBase64("images/store/storeimage/stoimage1.jpg"),
		StoreID:  store1.ID,
	}

	storeImage2 := entity.StoreImage{
		ImageURL: images.EncodeImageToBase64("images/store/storeimage/stoimage2.jpg"),
		StoreID:  store1.ID,
	}

	storeImage3 := entity.StoreImage{
		ImageURL: images.EncodeImageToBase64("images/store/storeimage/stoimage3.jpg"),
		StoreID:  store1.ID,
	}

	db.FirstOrCreate(&storeImage1, &entity.StoreImage{StoreID: store1.ID, ImageURL: storeImage1.ImageURL})
	db.FirstOrCreate(&storeImage2, &entity.StoreImage{StoreID: store1.ID, ImageURL: storeImage2.ImageURL})
	db.FirstOrCreate(&storeImage3, &entity.StoreImage{StoreID: store1.ID, ImageURL: storeImage3.ImageURL})

	bookingStore1 := entity.Bookingstore{
		BookerUserID: 1,
		StoreID:      store1.ID,
		ServiceID:    service1.ID,
		BookingTime:  "10:00",
		Date:         time.Now().AddDate(0, 0, 1),
		Status:       "pending",
		Notes:        "กรุณาเตรียมอาหารสำหรับน้องด้วย",
		TotalCost:    300,
		ContactNum:   "081-123-4567",
		CountPet:     1,
	}
	db.FirstOrCreate(&bookingStore1, &entity.Bookingstore{BookerUserID: 1, StoreID: store1.ID, ServiceID: service1.ID, Date: bookingStore1.Date})

	pet1 := entity.Pet{
		BookingID:  bookingStore1.ID,
		Name:       "มะลิ",
		Breed:      "เปอร์เซีย",
		Age:        2,
		Gender:     "Female",
		Weight:     4.5,
		Vaccinated: "Yes",
		OwnerID:    1,
		PicturePet: images.EncodeImageToBase64("images/store/pets/pet1.jpg"),
	}
	db.FirstOrCreate(&pet1, &entity.Pet{Name: "มะลิ", OwnerID: 1})

}
