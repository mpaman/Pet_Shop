package test

import (
	"testing"
	"github.com/mpaman/petshop/entity"
	"fmt"
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestUsers(t *testing.T){
	g := NewGomegaWithT(t)
	t.Run("Test Usr",func(t *testing.T){
		user :=entity.Users{
			FirstName : "",
			LastName : "Choeingulueam",
			Email: "1@gmail.com",
			Password: "123456",
			Age: 21,
			RoleID: 1,
			Phone: "0848319377",
			Address: "WOWOW",
			Profile: "image/test/wwowowo",
		}
		ok,err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("FirstName is required"))
	})

	t.Run("User is valid",func(t *testing.T){
		user :=entity.Users{
			FirstName : "Sitthichok",
			LastName : "Choeingulueam",
			Email: "1@gmail.com",
			Password: "123456",
			Age: 21,
			RoleID: 1,
			Phone: "0848319377",
			Address: "WOWOW",
			Profile: "image/test/wwowowo",
		}
		ok,err := govalidator.ValidateStruct(user)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Phon is invalid",func(t *testing.T){
		user :=entity.Users{
			FirstName : "Sitthichok",
			LastName : "Choeingulueam",
			Email: "1@gmail.com",
			Password: "123456",
			Age: 21,
			RoleID: 1,
			Phone: "08483193777",
			Address: "WOWOW",
			Profile: "image/test/wwowowo",
		}
		ok,err := govalidator.ValidateStruct(user)
		// fmt.Println("Eror: ",err)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal(fmt.Sprintf("phone: %s does not validate as stringlength(10|10)",user.Phone)))
	})

	t.Run("Test Email",func(t *testing.T){
		user :=entity.Users{
			FirstName : "Sitthichok",
			LastName : "Choeingulueam",
			Email: "121321gmail.com",
			Password: "123456",
			Age: 21,
			RoleID: 1,
			Phone: "0848319377",
			Address: "WOWOW",
			Profile: "image/test/wwowowo",
		}
		ok,err := govalidator.ValidateStruct(user)
		// fmt.Println("error: ",err)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())

		g.Expect(err.Error()).To(Equal("Email is invalid"))
	})
}