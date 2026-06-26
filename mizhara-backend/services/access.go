package services

import (
	"fmt"

	"mizhara-backend/lib"
)

func RequireAdmin(session *lib.SessionPayload) error {
	if session == nil {
		return lib.ErrUnauthorized
	}
	if session.Role != lib.RoleAdmin {
		return fmt.Errorf("%w: admin access required", lib.ErrForbidden)
	}
	return nil
}

func RequireCustomer(session *lib.SessionPayload) error {
	if session == nil {
		return lib.ErrUnauthorized
	}
	if session.Role != lib.RoleCustomer {
		return fmt.Errorf("%w: customer access required", lib.ErrForbidden)
	}
	return nil
}
