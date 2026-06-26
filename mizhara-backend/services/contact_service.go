package services

import (
	"context"
	"fmt"
	"html"
	"os"
	"strings"

	"mizhara-backend/lib"
)

type ContactInput struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

func SubmitContact(ctx context.Context, input ContactInput) (map[string]string, error) {
	name := strings.TrimSpace(input.Name)
	email := strings.TrimSpace(input.Email)
	subject := strings.TrimSpace(input.Subject)
	message := strings.TrimSpace(input.Message)

	if name == "" || email == "" || message == "" {
		return nil, lib.BadRequest("name, email, and message are required")
	}
	if subject == "" {
		subject = "General Inquiry"
	}

	supportTo := os.Getenv("SUPPORT_EMAIL")
	if supportTo == "" {
		supportTo = "support@mizhara.in"
	}

	mailSubject := fmt.Sprintf("[Mizhara Contact] %s — %s", subject, name)
	body := fmt.Sprintf(
		"<p><strong>Name:</strong> %s</p><p><strong>Email:</strong> %s</p><p><strong>Subject:</strong> %s</p><p><strong>Message:</strong></p><p>%s</p>",
		html.EscapeString(name),
		html.EscapeString(email),
		html.EscapeString(subject),
		strings.ReplaceAll(html.EscapeString(message), "\n", "<br>"),
	)

	result, err := lib.SendEmail(supportTo, mailSubject, body)
	if err != nil {
		return nil, err
	}

	resp := map[string]string{
		"message": "Thank you! Our support team will get back to you shortly.",
	}

	if !result.Sent {
		if os.Getenv("GO_ENV") == "development" {
			fmt.Printf("[contact] %s <%s> — %s\n%s\n", name, email, subject, message)
			return resp, nil
		}
		return nil, lib.BadRequest("email support is not available right now. Please use WhatsApp or Instagram.")
	}

	return resp, nil
}
