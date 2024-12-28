package test

import (
	"testing"
	"github.com/mpaman/petshop/entity"
	. "github.com/onsi/gomega"
)

func TestStoreImageURLIsRequired(t *testing.T) {
    g := NewGomegaWithT(t)
    mockStore := entity.Store{
        Name: "Mock Store",
    }

    storeImage := entity.StoreImage{
        ImageURL: "", 
        Store:    mockStore,
    }

    err := storeImage.Validate()
    g.Expect(err).NotTo(BeNil())
    g.Expect(err.Error()).To(Equal("Image URL is required"))
}

func TestStoreImageURLInvalidFormat(t *testing.T) {
	g := NewGomegaWithT(t)

	mockStore := entity.Store{
		Name: "Mock Store",
	}

	storeImage := entity.StoreImage{
		ImageURL: "invalid-url", // Invalid
		Store:    mockStore,
	}

	err := storeImage.Validate()
	g.Expect(err).NotTo(BeNil())
	g.Expect(err.Error()).To(Equal("Invalid URL format"))
}

func TestStoreImageValidURL(t *testing.T) {
	g := NewGomegaWithT(t)

	mockStore := entity.Store{
		Name: "Mock Store",
	}

	storeImage := entity.StoreImage{
		ImageURL: "https://example.com/image.jpg", // Valid
		Store:    mockStore,
	}

	err := storeImage.Validate()
	g.Expect(err).To(BeNil())
}
