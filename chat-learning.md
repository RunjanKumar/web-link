# 💬 Chat Feature — Step-by-Step Learning Guide

> **How to use**: Open your browser DevTools console, navigate to `/chat`, and follow the numbered console logs below. Each `STEP-N` corresponds to one action in the data flow.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                       CHAT FEATURE                             │
│                                                                │
│   UI (View)            ViewModel              Transport        │
│  ┌──────────┐       ┌──────────────┐      ┌───────────────┐   │
│  │ Chat.jsx │  ←──→ │ chatVM.js    │  ←─→ │ chatService   │   │
│  │ (page)   │       │ (brain)      │      │ (REST API)    │   │
│  └──────────┘       │              │      └───────────────┘   │
│       │             │              │      ┌───────────────┐   │
│       ├── ChatHeader│              │  ←─→ │ socketService  │   │
│       ├── ChatMessages              │      │ (WebSocket)   │   │
│       │   ├── DateDivider           │      └───────────────┘   │
│       │   ├── ChatBubble            │             │            │
│       │   │   └── MessageStatus     │      ┌───────────────┐   │
│       │   ├── ScrollToBottom        │      │ SocketContext  │   │
│       │   └── EmptyChat             │      │ (lifecycle)   │   │
│       ├── ChatInput  │              │      └───────────────┘   │
│       └── ConnectionBanner          │                          │
│                      └──────────────┘                          │
└────────────────────────────────────────────────────────────────┘
```

### Two transports:
- **REST API** (`chatService.js`) — Used for initial load + pagination (historical messages)
- **WebSocket** (`socketService.js`) — Used for realtime messages after initial load

---

## Flow 1: Opening Chat (Initial Load)

### What happens when you open `/chat`:

| Step | Layer | Console Tag | What Happens |
|------|-------|-------------|-------------|
| 1 | SocketContext | `[Socket] Connected ✓` | Socket connects on app mount (if authenticated) |
| 2 | ViewModel | `💬 [ChatVM] Component mounted` | `useEffect` triggers `loadMessages()` |
| 3 | ViewModel | `💬 STEP-1 [ChatVM] loadMessages()` | Starting REST API fetch |
| 4 | API Service | `🔵 STEP [ChatService → fetchConversationMessages]` | GET `/conversation/list?skip=0&limit=20` |
| 5 | API Service | `🟢 STEP [ChatService → fetchConversationMessages]` | Response with messages + totalCount |
| 6 | ViewModel | `💬 STEP-2 [ChatVM] Got N messages` | Extract from nested response |
| 7 | ViewModel | `💬 [ChatVM] normalizeMessage()` | Each raw message → clean frontend shape (×N times) |
| 8 | ViewModel | `💬 STEP-3 [ChatVM] Normalized & reversed` | Backend newest-first → display oldest-first |
| 9 | ViewModel | `💬 STEP-4 [ChatVM] Initial load complete` | hasMore + skip tracking set |
| 10 | ViewModel | `💬 [ChatVM] Setting up socket listeners` | Registers for realtime events |
| 11 | View | `🖥️ [Chat PAGE] Render` | Messages count, loading state |
| 12 | View | `🖥️ [ChatMessages] Render` | Message list rendered |
| 13 | View | `🖥️ [ChatBubble] Render` | Each bubble (×N times) |

### Backend message shape:
```json
{
  "_id": "msg_abc123",
  "message": "Hello, I need help with...",
  "senderId": { "_id": "user123" },
  "senderData": { "name": "John", "userType": 3 },
  "receivedBy": [{ "userId": "staff456", "status": 1 }],
  "createdAt": "2026-11-15T10:30:00Z",
  "messageType": 1
}
```

### Normalized frontend shape:
```json
{
  "id": "msg_abc123",
  "text": "Hello, I need help with...",
  "isOwn": true,
  "senderName": "You",
  "timestamp": "2026-11-15T10:30:00Z",
  "messageStatus": 1,
  "isSending": false,
  "isFailed": false
}
```

---

## Flow 2: Sending a Message (Optimistic UI)

### What happens when you type and hit Send:

| Step | Layer | Console Tag | What Happens |
|------|-------|-------------|-------------|
| 1 | ViewModel | `💬 STEP-1 [ChatVM] sendMessage()` | Text trimmed, tempId generated |
| 2 | ViewModel | `💬 STEP-2 [ChatVM] Optimistic message added` | Message appears INSTANTLY in UI (isSending=true) |
| 3a | ViewModel | `💬 STEP-3 [ChatVM] Emitting via socket` | If online → socket.emit('sendMessage') |
| 3b | ViewModel | `🟡 STEP-3 [ChatVM] OFFLINE → Queuing` | If offline → queued for later |
| 4 | ViewModel | `💬 [ChatVM] 🔔 Socket: newMessage` | Server echoes back confirmed message |
| 5 | ViewModel | `💬 [ChatVM] Case 1: Replacing optimistic` | Optimistic message replaced with real ID |
| 6 | View | `🖥️ [ChatBubble] Render` | Bubble re-renders: isSending=false |

### Key concept — Optimistic UI:
```
User types "Hi" → Click Send
  ↓
INSTANTLY: Message appears in UI (grey clock icon ⏰)
  ↓
Socket emits to server
  ↓
Server confirms → Replace with real ID (single tick ✓)
  ↓
Staff sees it → (double tick ✓✓)
  ↓
Staff reads it → (blue double tick ✓✓)
```

---

## Flow 3: Receiving a Message (Realtime)

### What happens when the staff sends you a message:

| Step | Layer | Console Tag | What Happens |
|------|-------|-------------|-------------|
| 1 | Socket | Server emits `newMessage` event | Via WebSocket |
| 2 | ViewModel | `💬 [ChatVM] 🔔 Socket event: newMessage` | Raw data received |
| 3 | ViewModel | `💬 [ChatVM] normalizeMessage()` | Transform to frontend shape |
| 4 | ViewModel | `💬 [ChatVM] Case 3: New from staff` | Dedup check passes → append |
| 5 | ViewModel | `💬 [ChatVM] markAsRead()` | Auto-emit read receipt |
| 6 | View | `🖥️ [ChatBubble] Render` | New bubble appears (left-aligned) |

### The 3 cases for `onNewMessage`:
```
Case 1: data.tempId matches our pending message
  → REPLACE optimistic message with server-confirmed one
  → Most common case when sending

Case 2: msg.isOwn but NO tempId
  → Server broadcast of our own message
  → Find matching optimistic by text content → replace
  → Or skip if already have by real ID
  → Or append if from another device

Case 3: !msg.isOwn
  → New message from staff
  → Dedup by ID → append to list
```

---

## Flow 4: Loading Older Messages (Scroll Up)

### What happens when you scroll to the top:

| Step | Layer | Console Tag | What Happens |
|------|-------|-------------|-------------|
| 1 | View | `ChatMessages → handleScroll()` | `scrollTop <= 10` detected |
| 2 | ViewModel | `💬 [ChatVM] loadMoreMessages()` | skip + limit pagination |
| 3 | API Service | `🔵 STEP [ChatService]` | GET with higher skip value |
| 4 | ViewModel | `💬 [ChatVM] New unique messages: N` | Deduped older messages |
| 5 | View | `ChatMessages` | Prepends to top, preserves scroll position |

---

## Flow 5: Reconnection

### What happens when you go offline and come back:

| Step | Layer | Console Tag | What Happens |
|------|-------|-------------|-------------|
| 1 | SocketContext | `[Socket] Disconnected` | Browser offline event |
| 2 | View | `ConnectionBanner` | Shows "You are offline" banner |
| 3 | SocketContext | `[Socket] Reconnect attempt N...` | Auto-reconnection |
| 4 | SocketContext | `[Socket] Reconnected ✓` | Connection restored |
| 5 | ViewModel | `💬 [ChatVM] Reconnected! Flushing N pending messages` | Re-sends queued messages |

---

## Message Status (WhatsApp-style)

| Status | Value | Icon | Meaning |
|--------|-------|------|---------|
| SENT | 1 | Single grey tick ✓ | Message left your device |
| DELIVERED | 2 | Double grey ticks ✓✓ | Message reached staff's device |
| SEEN | 3 | Double blue ticks ✓✓ | Staff opened and saw the message |
| Sending | — | Clock ⏰ | Optimistic UI (not yet confirmed) |
| Failed | — | Red X ✗ | Sending failed (retry available) |

---

## Component Tree

```
Chat.jsx (page — thin orchestrator)
  ├── ChatHeader
  │   ├── BackButton (global)
  │   └── Online/Offline dot
  ├── ConnectionBanner (offline/reconnecting banner)
  ├── LoadingChat (skeleton while loading)
  ├── ChatMessages (message list container)
  │   ├── Load More button (pagination)
  │   ├── DateDivider (date separators)
  │   ├── ChatBubble (individual message)
  │   │   └── MessageStatus (✓ ✓✓ ✓✓blue)
  │   ├── ScrollToBottom (FAB button)
  │   └── EmptyChat (no messages state)
  └── ChatInput (text input + send button)
```

---

## Socket Events Reference

### Client → Server:
| Event | Constant | Payload | When |
|-------|----------|---------|------|
| `sendMessage` | `CLIENT_EVENTS.SEND_MESSAGE` | `{ message, tempId }` | User sends a message |
| `readMessage` | `CLIENT_EVENTS.READ_MESSAGE` | `{ messageId }` | User sees a staff message |
| `typing` | `CLIENT_EVENTS.TYPING` | — | (Future) User is typing |

### Server → Client:
| Event | Constant | Payload | When |
|-------|----------|---------|------|
| `newMessage` | `SERVER_EVENTS.NEW_MESSAGE` | Full message object | New message (own echo or staff) |
| `readMessage` | `SERVER_EVENTS.READ_MESSAGE` | `{ messageId }` | Staff read our message |
| `connect` | `SERVER_EVENTS.CONNECT` | — | Socket connected |
| `disconnect` | `SERVER_EVENTS.DISCONNECT` | `reason` | Socket disconnected |

---

## If/Then Scenarios

| If you want to... | Then modify... |
|---|---|
| Change the chat server URL | `socketEvents.js` → `SOCKET_CONFIG.URL` |
| Change pagination size | `chatViewModel.js` → `PAGE_SIZE` constant |
| Change message bubble colors | `ChatBubble.jsx` → className conditionals |
| Add image/file messages | `chatViewModel.js` + new `ChatBubble` variant |
| Change the "Reception" title | `ChatHeader.jsx` → h1 text |
| Change status tick icons | `MessageStatus.jsx` → SVG elements |
| Enable typing indicator | Uncomment in `ChatInput` + `ChatMessages` |
| Change reconnection behavior | `socketEvents.js` → `SOCKET_CONFIG` |
| Change offline message queueing | `chatViewModel.js` → `sendMessage()` offline branch |
