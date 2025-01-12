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
		&entity.Servicearea{},
		&entity.Role{},
		&entity.Pettype{},
		&entity.BookingPets{},
	)
	//role fix ตาม id นี้เลย
	admin := entity.Role{Rolename: "admin"}
	db.FirstOrCreate(&admin, &entity.Role{Rolename: "admin"})

	user := entity.Role{Rolename: "user"}
	db.FirstOrCreate(&user, &entity.Role{Rolename: "user"})

	store := entity.Role{Rolename: "store"}
	db.FirstOrCreate(&store, &entity.Role{Rolename: "store"})

	//PetType
	Cat := entity.Pettype{PtName: "แมว"}
	Dog := entity.Pettype{PtName: "สุนัข"}
	Bird := entity.Pettype{PtName: "นก"}
	db.FirstOrCreate(&Cat, &entity.Pettype{PtName: "แมว"})
	db.FirstOrCreate(&Dog, &entity.Pettype{PtName: "สุนัข"})
	db.FirstOrCreate(&Bird, &entity.Pettype{PtName: "นก"})

	hashedPassword, _ := HashPassword("1")

	User := &entity.Users{

		FirstName: "Software",

		LastName: "Analysis",

		Email: "1@gmail.com",

		Age: 80,

		Password: hashedPassword,

		RoleID: 1,

		Address: "thailand",

		Phone: "0848319377",

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
		ProvinceID:   1,
		ContactInfo:  "0811234567",
		Description:  "ร้านอุปกรณ์สัตว์เลี้ยงที่มีสินค้าครบครัน",
		TimeOpen:     "09:00",
		TimeClose:    "18:00",
		Status:       "open",
	}

	db.FirstOrCreate(&store1, &entity.Store{Name: "Happy Pet Store"})

	service1 := entity.Service{
		StoreID:       store1.ID,
		NameService:   "อาบน้ำและตัดขน",
		CategoryPetID: 1,
		Duration:      60,
		Price:         300,
	}

	service2 := entity.Service{
		StoreID:       store1.ID,
		NameService:   "ตรวจสุขภาพ",
		CategoryPetID: 2,
		Duration:      30,
		Price:         500,
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
		TotalCost:    300.0,
		ContactNum:   "081-123-4567",
		CountPet:     1,
	}
	db.FirstOrCreate(&bookingStore1, &entity.Bookingstore{BookerUserID: 1, StoreID: store1.ID, ServiceID: service1.ID, Date: bookingStore1.Date})

	pet1 := entity.Pet{
		Name:       "มะลิ",
		Breed:      "เปอร์เซีย",
		Age:        2,
		Gender:     "Female",
		Weight:     4.5,
		Vaccinated: "Yes",
		OwnerID:    1.0,
		PicturePet: images.EncodeImageToBase64("images/store/pets/pet1.jpg"),
	}
	db.FirstOrCreate(&pet1, &entity.Pet{Name: "มะลิ", OwnerID: 1})

	// รายชื่อจังหวัดในประเทศไทยทั้งหมด
	provinces := []string{
		"นครราชสีมา", "เชียงใหม่", "กรุงเทพมหานคร", "อุบลราชธานี", "ขอนแก่น", "ชลบุรี", "สุราษฎร์ธานี", "อยุธยา", "ปทุมธานี", "นครปฐม",
		"เชียงราย", "สระบุรี", "บุรีรัมย์", "สมุทรปราการ", "อุดรธานี", "เพชรบุรี", "นนทบุรี", "สุพรรณบุรี", "นครสวรรค์", "พิษณุโลก",
		"สงขลา", "สระแก้ว", "ลำปาง", "ระยอง", "ประจวบคีรีขันธ์", "ราชบุรี", "แม่ฮ่องสอน", "ลำพูน", "พะเยา", "มุกดาหาร",
		"พิจิตร", "ปัตตานี", "ตรัง", "หนองคาย", "บึงกาฬ", "สมุทรสงคราม", "กระบี่", "อำนาจเจริญ", "สุโขทัย", "หนองบัวลำภู",
		"นครศรีธรรมราช", "ตราด", "กำแพงเพชร", "ระนอง", "มหาสารคาม", "สตูล", "พัทลุง", "ศรีสะเกษ", "สิงห์บุรี", "ขอนแก่น",
		"เชียงราย", "ชุมพร", "สกลนคร", "ราชบุรี", "ภูเก็ต", "ลพบุรี", "นราธิวาส", "สุรินทร์", "อ่างทอง", "กรุงเทพมหานคร",
		"กระบี่", "ลำพูน", "อุบลราชธานี", "สุโขทัย", "ราชบุรี", "ระยอง", "สระบุรี", "พะเยา", "นครสวรรค์", "สมุทรสาคร",
		"ชัยนาท", "สุพรรณบุรี", "พิษณุโลก", "เพชรบุรี", "ระยอง", "สมุทรปราการ", "สตูล", "นครปฐม", "นราธิวาส", "ศรีสะเกษ",
		"หนองคาย", "บึงกาฬ", "บุรีรัมย์", "ลำปาง", "มุกดาหาร", "พิจิตร", "ปัตตานี", "ตาก", "พิษณุโลก", "ลำพูน",
		"สมุทรสงคราม", "สิงห์บุรี", "กระบี่", "ชุมพร", "สุรินทร์", "นครศรีธรรมราช",
	}

	// เพิ่มจังหวัดทั้งหมดลงในฐานข้อมูล
	for _, province := range provinces {
		db.FirstOrCreate(&entity.Servicearea{}, &entity.Servicearea{SaName: province})
	}
}
