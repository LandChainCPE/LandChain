// controller.go (Backend)

package controller

import (
	"net/http"
	"log"
	"github.com/gin-gonic/gin"
	"landchain/config"
	"landchain/entity"
)

func CreateUser(c *gin.Context) {
	var input struct {
		Firstname    string `json:"firstname"`
		Lastname     string `json:"lastname"`
		Phonenumber  string `json:"phonenumber"`
		Email        string `json:"email"`
		Metamaskaddress string `json:"Metamaskaddress"`
	}

	// รับข้อมูลจาก request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// สร้างผู้ใช้ใหม่ในฐานข้อมูล
	user := entity.Users{
		Firstname:    input.Firstname,
		Lastname:     input.Lastname,
		Phonenumber:  input.Phonenumber,
		Email:        input.Email,
		Metamaskaddress: input.Metamaskaddress,
	}

	// บันทึกข้อมูลลงในฐานข้อมูล
	if err := config.DB().Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log ข้อมูลและตอบกลับว่า Public Key ถูกบันทึกสำเร็จ
	log.Printf("User data saved for: %s", input.Firstname)
	c.JSON(http.StatusOK, gin.H{"message": "User data saved successfully", "user": user})
}
