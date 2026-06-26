package lib

import (
	"fmt"
	"net/smtp"
	"os"
	"strconv"
)

func IsEmailConfigured() bool {
	return os.Getenv("SMTP_HOST") != "" &&
		os.Getenv("SMTP_USER") != "" &&
		os.Getenv("SMTP_PASS") != "" &&
		os.Getenv("SMTP_FROM") != ""
}

type EmailResult struct {
	Sent bool `json:"sent"`
}

func SendEmail(to, subject, html string) (EmailResult, error) {
	if !IsEmailConfigured() {
		return EmailResult{Sent: false}, nil
	}

	host := os.Getenv("SMTP_HOST")
	port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
	if port == 0 {
		port = 587
	}
	from := os.Getenv("SMTP_FROM")
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASS")

	msg := []byte(fmt.Sprintf("To: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s", to, subject, html))
	auth := smtp.PlainAuth("", user, pass, host)
	addr := fmt.Sprintf("%s:%d", host, port)
	err := smtp.SendMail(addr, auth, from, []string{to}, msg)
	if err != nil {
		return EmailResult{Sent: false}, err
	}
	return EmailResult{Sent: true}, nil
}

func GetAppURL() string {
	if u := os.Getenv("APP_URL"); u != "" {
		return u
	}
	return "http://localhost:5173"
}
