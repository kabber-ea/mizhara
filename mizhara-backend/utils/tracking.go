package utils

import (
	"fmt"
	"net/url"
	"strings"

	"mizhara-backend/constants"
)

type TrackingProvider string

func BuildTrackingURL(provider TrackingProvider, trackingNumber, customURL string) string {
	trimmed := strings.TrimSpace(trackingNumber)
	if trimmed == "" {
		return ""
	}
	if strings.TrimSpace(customURL) != "" {
		return strings.TrimSpace(customURL)
	}
	if string(provider) == constants.TrackingOther {
		return ""
	}
	enc := url.QueryEscape(trimmed)
	switch string(provider) {
	case constants.TrackingDelhivery:
		return fmt.Sprintf("https://www.delhivery.com/track/package/%s", enc)
	case constants.TrackingBlueDart:
		return fmt.Sprintf("https://www.bluedart.com/web/guest/trackdartresultthirdparty?trackFor=0&trackNo=%s", enc)
	case constants.TrackingDTDC:
		return fmt.Sprintf("https://www.dtdc.in/tracking.asp?strCnno=%s", enc)
	case constants.TrackingIndiaPost:
		return fmt.Sprintf("https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx?consignmentnumber=%s", enc)
	case constants.TrackingShiprocket:
		return fmt.Sprintf("https://shiprocket.co/tracking/%s", enc)
	default:
		return ""
	}
}
