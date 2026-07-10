package services

import (
	"fmt"

	"mizhara-backend/lib"
	"mizhara-backend/utils"
)

func RequireAdmin(session *lib.SessionPayload) error {
	if session == nil {
		return utils.ErrUnauthorized
	}
	if session.Role != lib.RoleAdmin {
		return fmt.Errorf("%w: admin access required", utils.ErrForbidden)
	}
	return nil
}

func RequireCustomer(session *lib.SessionPayload) error {
	if session == nil {
		return utils.ErrUnauthorized
	}
	if session.Role != lib.RoleCustomer {
		return fmt.Errorf("%w: customer access required", utils.ErrForbidden)
	}
	return nil
}
