package lib

import (
	"fmt"
	"net/url"
	"strings"
)

type TrackingProvider string

const (
	ProviderDelhivery  TrackingProvider = "delhivery"
	ProviderBlueDart   TrackingProvider = "bluedart"
	ProviderDTDC       TrackingProvider = "dtdc"
	ProviderIndiaPost  TrackingProvider = "indiapost"
	ProviderShiprocket TrackingProvider = "shiprocket"
	ProviderOther      TrackingProvider = "other"
)

func BuildTrackingURL(provider TrackingProvider, trackingNumber, customURL string) string {
	trimmed := strings.TrimSpace(trackingNumber)
	if trimmed == "" {
		return ""
	}
	if strings.TrimSpace(customURL) != "" {
		return strings.TrimSpace(customURL)
	}
	if provider == ProviderOther {
		return ""
	}
	enc := url.QueryEscape(trimmed)
	switch provider {
	case ProviderDelhivery:
		return fmt.Sprintf("https://www.delhivery.com/track/package/%s", enc)
	case ProviderBlueDart:
		return fmt.Sprintf("https://www.bluedart.com/web/guest/trackdartresultthirdparty?trackFor=0&trackNo=%s", enc)
	case ProviderDTDC:
		return fmt.Sprintf("https://www.dtdc.in/tracking.asp?strCnno=%s", enc)
	case ProviderIndiaPost:
		return fmt.Sprintf("https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx?consignmentnumber=%s", enc)
	case ProviderShiprocket:
		return fmt.Sprintf("https://shiprocket.co/tracking/%s", enc)
	default:
		return ""
	}
}

func GetProviderLabel(provider TrackingProvider) string {
	labels := map[TrackingProvider]string{
		ProviderDelhivery:  "Delhivery",
		ProviderBlueDart:   "Blue Dart",
		ProviderDTDC:       "DTDC",
		ProviderIndiaPost:  "India Post",
		ProviderShiprocket: "Shiprocket",
		ProviderOther:      "Other",
	}
	if l, ok := labels[provider]; ok {
		return l
	}
	return string(provider)
}
