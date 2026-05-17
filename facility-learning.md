# 🏨 Facility Feature — Step-by-Step Learning Guide

> **How to use**: Open your browser DevTools console, navigate to any facility page, and follow the numbered console logs below. Each `STEP-N` corresponds to one action in the data flow.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    FACILITY FEATURE                      │
│                                                          │
│   UI (View)           ViewModel            API Service   │
│  ┌─────────┐      ┌──────────────┐     ┌─────────────┐  │
│  │Facilities│ ←──→ │facilityVM    │ ←─→ │facilityServ │  │
│  │  .jsx    │      │  .js         │     │  ice.js     │  │
│  └─────────┘      └──────────────┘     └─────────────┘  │
│  ┌─────────┐      ┌──────────────┐           │          │
│  │Facility │ ←──→ │facilityDetail│           │          │
│  │Detail   │      │  VM.js       │           │          │
│  └─────────┘      └──────────────┘           │          │
│  ┌─────────┐      ┌──────────────┐           │          │
│  │Reserve  │ ←──→ │reserveVM.js  │ ─────────→│          │
│  │Table    │      │              │           │          │
│  └─────────┘      └──────────────┘           │          │
│  ┌─────────┐      ┌──────────────┐           │          │
│  │Upcoming │ ←──→ │bookedFacility│ ─────────→│          │
│  │Events   │      │  VM.js       │           │          │
│  └─────────┘      └──────────────┘           │          │
└──────────────────────────────────────────────────────────┘
```

---

## Flow 1: Browsing Facilities (List Page)

### What happens when you open `/facilities`:

| Step | Layer | Console Tag | What Happens |
|------|-------|-------------|-------------|
| 1 | ViewModel | `🏨 [FacilityVM] Component mounted` | `useEffect` triggers `fetchFacilities()` |
| 2 | ViewModel | `🏨 STEP-1 [FacilityVM] fetchFacilities()` | Sets `loading=true`, clears error |
| 3 | API Service | `🔵 STEP [FacilityService → getFacility]` | Axios GET to `/v1/hotelFacility` |
| 4 | API Service | `🟢 STEP [FacilityService → getFacility]` | Response received from backend |
| 5 | ViewModel | `🏨 STEP-2 [FacilityVM] API returned` | Raw response keys logged |
| 6 | ViewModel | `🏨 STEP-3 [FacilityVM] Extracted categories` | Categories array length logged |
| 7 | ViewModel | `🏨 STEP-4 [FacilityVM] First category sample` | Shape of first category object |
| 8 | ViewModel | `🏨 STEP-5 [FacilityVM] Auto-selecting first tab` | Sets default active tab |
| 9 | ViewModel | `🏨 STEP-6 [FacilityVM] Done` | `loading=false` |
| 10 | View | `🖥️ [Facilities PAGE] Render` | Shows tab count + card count |

### Backend data shape:
```json
{
  "data": [
    {
      "_id": "abc123",
      "name": "Dining",           // ← Tab label
      "imageUrl": "https://...",   // ← Tab image
      "types": [                   // ← Cards inside this tab
        {
          "_id": "type1",
          "name": "Latitude",
          "description": "...",
          "image": "https://...",
          "startTime": "09:00",
          "endTime": "22:00",
          "days": [0,1,2,3,4,5,6],
          "isAvailable": true
        }
      ]
    }
  ]
}
```

### If you want to change:
- **Add a new tab** → Backend adds a new category → auto-appears as a tab
- **Change tab appearance** → Edit `FacilityTabs.jsx` component
- **Change card layout** → Edit `FacilityCard.jsx` component

---

## Flow 2: Viewing Facility Details

### What happens when you click a facility card:

| Step | Layer | Console Tag | What Happens |
|------|-------|-------------|-------------|
| 1 | ViewModel | `🏨 [FacilityVM] Card clicked` | `navigate('/facilities/detail', { state: { facility } })` |
| 2 | ViewModel | `🔍 STEP-1 [FacilityDetailVM]` | Extracts facility from `location.state` |
| 3 | ViewModel | `🔍 STEP-2 [FacilityDetailVM]` | Formats timings, days, pricing |
| 4 | ViewModel | `🔍 STEP-3 [FacilityDetailVM]` | Builds `infoSections[]` array |
| 5 | View | `🖥️ [FacilityDetail PAGE] Render` | Maps over infoSections |

### Key insight:
The detail page does NOT make any API call. It receives all data via `navigate()` state from the list page.

---

## Flow 3: Making a Reservation

### What happens when you fill the form and click "Reserve":

| Step | Layer | Console Tag | What Happens |
|------|-------|-------------|-------------|
| 1 | ViewModel | `📝 STEP-1 [ReserveVM] submitReservation()` | User clicked Reserve |
| 2 | ViewModel | `📝 STEP-2 [ReserveVM] Validation` | Checks dateTime + numberOfPeople |
| 3 | ViewModel | `📝 STEP-3 [ReserveVM] Payload built` | Shows exact JSON sent to backend |
| 4 | ViewModel | `📝 STEP-4 [ReserveVM] Calling API...` | Triggers service function |
| 5 | API Service | `🔵 STEP [FacilityService → submitFacilityReservation]` | POST to backend |
| 6 | API Service | `🟢 STEP [FacilityService → submitFacilityReservation]` | Success response |
| 7 | ViewModel | `🟢 STEP-5 [ReserveVM] SUCCESS!` | Reservation confirmed |
| 8 | ViewModel | `📝 STEP-6 [ReserveVM] Navigating` | Goes to bookings page |

### Payload shape (what gets POSTed):
```json
{
  "facilityId": "parent_category_id",
  "facilityTypeId": "specific_type_id",
  "bookingDate": "2026-11-15T12:30:00.000Z",
  "numberOfGuests": 2
}
```

---

## Flow 4: Viewing Bookings (Upcoming Events)

### What happens when you open `/facilities/upcoming-events`:

| Step | Layer | Console Tag | What Happens |
|------|-------|-------------|-------------|
| 1 | ViewModel | `📋 [BookedFacilityVM] Component mounted` | Triggers fetch |
| 2 | ViewModel | `📋 STEP-1 [BookedFacilityVM] fetchReservations()` | Loading starts |
| 3 | API Service | `🔵 STEP [FacilityService → getFacilityReservations]` | GET request |
| 4 | ViewModel | `📋 STEP-3 [BookedFacilityVM] Extracted` | Array of bookings |
| 5 | ViewModel | `📋 [BookedFacilityVM] formatBookingForDisplay()` | Each booking transformed |
| 6 | ViewModel | `📋 [BookedFacilityVM] Groups` | Pending/Approved/Disapproved counts |
| 7 | View | `🖥️ [UpcomingEvents PAGE] Render` | Shows final counts |

### Status flow:
```
Guest books → Status: PENDING (1)
  ↓
Admin approves → Status: APPROVED (2)  → Green "Booking Confirm"
  OR
Admin rejects → Status: DISAPPROVED (3) → Red "Booking Disapproved"
```

---

## Component Tree

```
Facilities.jsx (page)
  ├── ThreeDotMenu (global)
  ├── FacilityTabs (tabs from categories)
  ├── FacilityCard (card from types[])
  └── BottomNav (global)

FacilityDetail.jsx (page)
  ├── OverlayBackButton
  ├── ExpandableDescription
  └── InfoSection (mapped from ViewModel array)

ReserveTable.jsx (page)
  └── OverlayBackButton

UpcomingEvents.jsx (page)
  ├── BackButton (global)
  └── BookingList
      └── BookingCard
          └── EventInfoRow (×4 rows: date, guests, location, status)
              └── Icons from assets/icons/
```

---

## If/Then Scenarios

| If you want to... | Then modify... |
|---|---|
| Change the booking form fields | `reserveViewModel.js` → payload + validation |
| Add a new info row on the detail page | `facilityDetailViewModel.js` → `infoSections[]` |
| Change booking status labels | `constant.js` → `FACILITY_STATUS_LABELS` |
| Change status colors | `constant.js` → `FACILITY_STATUS_COLORS` |
| Change card icon colors | `BookingCard.jsx` → `color` prop on icons |
| Add a new facility API call | `facilityService.js` → new export function |
| Change the "New Booking" button | `UpcomingEvents.jsx` → bottom button JSX |
