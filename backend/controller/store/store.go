package store

import (
	"net/http"
	// "strconv"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)


func GetStoreByID(c *gin.Context) {
    storeID := c.Param("id")
    var store entity.Store

    if err := config.DB().Preload("Services").Preload("User").First(&store, storeID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
        return
    }

    c.JSON(http.StatusOK, store)
}

func GetAllStores(c *gin.Context) {
	var stores []entity.Store
	db := config.DB()
	if err := db.Preload("User").Preload("Services").Find(&stores).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve stores"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stores})
}

// UpdateStore: อัพเดตร้านตาม ID
func UpdateStore(c *gin.Context) {
	storeID := c.Param("id")
	var payload entity.Store

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Find the store by ID
	var store entity.Store
	db := config.DB()
	if err := db.First(&store, storeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	// Update store fields
	store.Name = payload.Name
	store.Location = payload.Location
	store.ContactInfo = payload.ContactInfo
	store.Description = payload.Description
	store.TimeOpen = payload.TimeOpen
	store.Status = payload.Status
	store.TimeClose= payload.TimeClose
	store.AddressStore= payload.AddressStore

	// Save the updated store
	if err := db.Save(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update store"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Store updated successfully", "store": store})
}

// DeleteStore: ลบร้านตาม ID
func DeleteStore(c *gin.Context) {
	id := c.Param("id") // รับ ID ของ Store

	db := config.DB()

	// เริ่ม Transaction
	tx := db.Begin()

	// ลบข้อมูลใน Bookingstore ที่เกี่ยวข้อง
	if err := tx.Where("store_id = ?", id).Delete(&entity.Bookingstore{}).Error; err != nil {
		tx.Rollback() // ย้อนกลับการเปลี่ยนแปลงถ้ามีข้อผิดพลาด
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete related bookingstore data"})
		return
	}

	// ลบข้อมูลใน Service ที่เกี่ยวข้อง
	if err := tx.Where("store_id = ?", id).Delete(&entity.Service{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete related service data"})
		return
	}

	// ลบข้อมูลใน StoreImage ที่เกี่ยวข้อง
	if err := tx.Where("store_id = ?", id).Delete(&entity.StoreImage{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete related store images"})
		return
	}

	// ลบข้อมูลของ Store
	if err := tx.Delete(&entity.Store{}, id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete store"})
		return
	}

	// Commit การเปลี่ยนแปลงถ้าทุกอย่างสำเร็จ
	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "Store and related data deleted successfully"})
}
// UpdateStoreStatus: อัพเดตสถานะของร้านตาม ID
func UpdateStoreStatus(c *gin.Context) {
	storeID := c.Param("id")
	var payload struct {
		Status string `json:"status"` // รับสถานะใหม่
	}

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Find the store by ID
	var store entity.Store
	db := config.DB()
	if err := db.First(&store, storeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	// Update the store's status
	store.Status = payload.Status

	// Save the updated store
	if err := db.Save(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update store status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Store status updated successfully", "store": store})
}
