package controller

import (
	"net/http"
	"strconv"
	"time"
	"fmt"

	"landchain/config"
	"landchain/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

/* ---------------------- State Machine guard ---------------------- */

var allowed = map[entity.VerificationStatus][]entity.VerificationStatus{
	entity.StatusPending:    {entity.StatusScheduled, entity.StatusExpired, entity.StatusRejected},
	entity.StatusScheduled:  {entity.StatusInProgress, entity.StatusExpired, entity.StatusRejected},
	entity.StatusInProgress: {entity.StatusApproved, entity.StatusRejected},
	entity.StatusApproved:   {entity.StatusRevoked},
}

func canTransit(from, to entity.VerificationStatus) bool {
	if list, ok := allowed[from]; ok {
		for _, v := range list {
			if v == to {
				return true
			}
		}
	}
	return false
}

/* ---------------------- DTOs ---------------------- */

type startReq struct {
	SubjectType entity.VerificationSubject `json:"subjectType" binding:"required"` // "USER_IDENTITY" | "LAND_TITLE_OWNERSHIP"
	SubjectID   uint                       `json:"subjectId"   binding:"required"`
}

type updateReq struct {
	To     entity.VerificationStatus `json:"to"     binding:"required"`
	Reason *string                   `json:"reason"`
}

/* ---------------------- Handlers ---------------------- */

// POST /verifications
// Body: { "subjectType":"USER_IDENTITY", "subjectId":1 }
func StartVerification(c *gin.Context) {
	var req startReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	db := config.DB()
	var requestedBy *uint
	if uid, exists := c.Get("userID"); exists {
		u := uint(uid.(uint))
		requestedBy = &u
	}

	v := &entity.Verification{
		SubjectID:         req.SubjectID,
		SubjectType:       req.SubjectType,
		Status:            entity.StatusPending,
		RequestedByUserID: requestedBy,
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(v).Error; err != nil {
			return err
		}
		ev := entity.VerificationEvent{
			VerificationID: v.ID,
			ToStatus:       entity.StatusPending,
			ChangedByUserID: requestedBy,
		}
		return tx.Create(&ev).Error
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, v)
}

// ✅ สะดวกใช้เฉพาะโฉนด: POST /landtitles/:id/verify  (wrapper เรียก StartVerification logic)
func StartLandVerification(c *gin.Context) {
	landID64, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var requestedBy *uint
	if uid, exists := c.Get("userID"); exists {
		u := uint(uid.(uint))
		requestedBy = &u
	}

	db := config.DB()
	v := &entity.Verification{
		SubjectID:         uint(landID64),
		SubjectType:       entity.SubjectLandTitleOwnership,
		Status:            entity.StatusPending,
		RequestedByUserID: requestedBy,
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(v).Error; err != nil {
			return err
		}
		ev := entity.VerificationEvent{
			VerificationID:  v.ID,
			ToStatus:        entity.StatusPending,
			ChangedByUserID: requestedBy,
		}
		return tx.Create(&ev).Error
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, v)
}

// GET /verifications/latest?subjectType=USER_IDENTITY&subjectId=1
func GetLatestVerification(c *gin.Context) {
	st := entity.VerificationSubject(c.Query("subjectType"))
	sid, _ := strconv.ParseUint(c.Query("subjectId"), 10, 64)

	var v entity.Verification
	if err := config.DB().
		Where("subject_type = ? AND subject_id = ?", st, uint(sid)).
		Order("updated_at DESC").
		First(&v).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var lastEv entity.VerificationEvent
	_ = config.DB().
		Where("verification_id = ?", v.ID).
		Order("created_at DESC").
		First(&lastEv).Error

	c.JSON(http.StatusOK, gin.H{
		"id":          v.ID,
		"subjectType": v.SubjectType,
		"subjectId":   v.SubjectID,
		"status":      v.Status,
		"updatedAt":   v.UpdatedAt,
		"expiresAt":   v.ExpiresAt,
		"lastEvent": gin.H{
			"fromStatus": lastEv.FromStatus,
			"toStatus":   lastEv.ToStatus,
			"reason":     lastEv.Reason,
			"at":         lastEv.CreatedAt,
		},
	})
}

// PUT /verifications/:id/status   Body: { "to":"APPROVED", "reason":"..." }
func UpdateVerificationStatus(c *gin.Context) {
	id64, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req updateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	var changedBy *uint
	if uid, ok := c.Get("userID"); ok {
		u := uint(uid.(uint))
		changedBy = &u
	}

	db := config.DB()
	err := db.Transaction(func(tx *gorm.DB) error {
		var v entity.Verification
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&v, uint(id64)).Error; err != nil {
			return err
		}

		if !canTransit(v.Status, req.To) {
			return gin.Error{Err: errInvalidTransition(v.Status, req.To)}
		}

		from := v.Status
		v.Status = req.To
		if err := tx.Save(&v).Error; err != nil {
			return err
		}

		ev := entity.VerificationEvent{
			VerificationID:  v.ID,
			FromStatus:      &from,
			ToStatus:        req.To,
			ChangedByUserID: changedBy,
			Reason:          req.Reason,
			CreatedAt:       time.Now(),
		}
		if err := tx.Create(&ev).Error; err != nil {
			return err
		}

		// อัปเดตฟิลด์สรุปที่ subject
		switch v.SubjectType {
		case entity.SubjectUserIdentity:
			up := map[string]any{
				"identity_verification_status": string(v.Status),
			}
			if v.Status == entity.StatusApproved {
				up["identity_verified_at"] = time.Now()
			}
			if err := tx.Model(&entity.Users{}).Where("id = ?", v.SubjectID).Updates(up).Error; err != nil {
				return err
			}

		case entity.SubjectLandTitleOwnership:
			up := map[string]any{
				"ownership_verification_status": string(v.Status),
			}
			if v.Status == entity.StatusApproved {
				up["ownership_verified_at"] = time.Now()
			}
			if err := tx.Model(&entity.Landtitle{}).Where("id = ?", v.SubjectID).Updates(up).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// GET /verifications/:id/events
func ListVerificationEvents(c *gin.Context) {
	id64, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var ev []entity.VerificationEvent
	if err := config.DB().
		Where("verification_id = ?", uint(id64)).
		Order("created_at ASC").
		Find(&ev).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, ev)
}

// helper
func errInvalidTransition(from, to entity.VerificationStatus) error {
	return fmt.Errorf("invalid transition: %s -> %s", from, to)
}

