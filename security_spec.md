# Security Specification & "Dirty Dozen" Malicious Payloads

This specification defines the security invariants and malicious payloads designed to audit the Firestore security rules.

## Data Invariants
1. **Agenda Items**: Only authenticated users (specifically the Owner) can create, read, update, or delete items in the `/agenda` collection.
2. **Sticky Notes (Recados)**: Any authenticated user (including guests) can read notes and create notes, but updating existing notes is restricted.
3. **Memories (Memorias)**: Guests can only read memories marked with `isShared == true`.
4. **Letters (Cartinhas)**: Letters can be written by guests, but reading delivered letters or editing them is restricted to the owner, or based on strict delivery date rules.
5. **Conversations & Messages**: Users can read and post messages inside specific room IDs. Message text and ids must be strictly validated.
6. **Immutable Fields**: Fields like `createdAt` and `id` must be immutable once written.
7. **Strict Schema Constraints**: No extra fields (ghost keys) can be written to any collection.

---

## The "Dirty Dozen" Malicious Payloads

Below are 12 specific JSON payloads designed to attempt to breach the system's laws of Identity, Integrity, and State. All of these must return `PERMISSION_DENIED` under our security rules.

### Payload 1: Admin Spoofing / Privilege Escalation
An attacker attempts to write an Agenda item or elevate privileges by setting a mock admin flag.
- **Collection**: `/agenda/malicious-item-1`
- **Payload**:
  ```json
  {
    "id": "malicious-item-1",
    "title": "Hacked Event",
    "date": "2026-06-24",
    "status": "todo",
    "priority": "high",
    "isAdmin": true,
    "role": "admin"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED` (No extra properties allowed, and only Owner can write to agenda).

### Payload 2: Ghost Field injection on Recados (Shadow Update)
An attacker attempts to inject a shadow state or verified badge on the Sticky Notes board.
- **Collection**: `/recados/sticker-1`
- **Payload**:
  ```json
  {
    "id": "sticker-1",
    "title": "Malicious Sticky Note",
    "text": "Hello world",
    "color": "yellow",
    "priority": "low",
    "isPinned": false,
    "createdAt": "2026-06-24T14:00:00Z",
    "verifiedUserBadge": true
  }
  ```
- **Expected Result**: `PERMISSION_DENIED` (Rejecting unknown fields).

### Payload 3: Bypassing Immutable Date (Retroactive Hijack)
An attacker tries to update an existing Recado's immutable `createdAt` field.
- **Collection**: `/recados/sticker-1`
- **Payload**:
  ```json
  {
    "id": "sticker-1",
    "title": "Malicious Sticky Note",
    "text": "Updated content",
    "color": "yellow",
    "priority": "low",
    "isPinned": false,
    "createdAt": "2000-01-01T00:00:00Z"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED` (Immutability check failed).

### Payload 4: Invalid Date format Injection (Temporal Poisoning)
An attacker attempts to set an invalid text string on a date property in the Agenda.
- **Collection**: `/agenda/agenda-item-2`
- **Payload**:
  ```json
  {
    "id": "agenda-item-2",
    "title": "Poisoned Date",
    "date": "not-a-date-at-all",
    "status": "todo",
    "priority": "low"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED` (Date format validation failed).

### Payload 5: Deny-of-Wallet Document ID Poisoning (ID Size Attack)
An attacker tries to write a document using an exceptionally large string as the ID to blow up resource limits.
- **Collection**: `/recados/` + `A` repeated 2000 times
- **Payload**:
  ```json
  {
    "id": "too-long-id",
    "title": "Attack",
    "text": "Sticker text",
    "color": "blue",
    "priority": "medium",
    "isPinned": false,
    "createdAt": "2026-06-24T14:00:00Z"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED` (Document ID length check failed / isValidId).

### Payload 6: Reading Unshared Private Memories
A guest user attempts to read memories with `isShared = false`.
- **Collection**: `/memorias/private-mem-1`
- **Payload**: (Fetch request by Guest)
- **Expected Result**: `PERMISSION_DENIED` (Only shared memories readable by guests).

### Payload 7: Letter Forgery (Self-Opening / Future Spoof)
A guest writes a letter but forces it to be already opened (`isOpened: true`).
- **Collection**: `/cartinhas/letter-1`
- **Payload**:
  ```json
  {
    "id": "letter-1",
    "title": "Forgery",
    "content": "Secret letter text",
    "sender": "Attacker",
    "recipient": "João",
    "date": "2026-06-24",
    "deliverAt": "2026-06-24",
    "stampType": "floral",
    "sealColor": "burgundy",
    "isOpened": true
  }
  ```
- **Expected Result**: `PERMISSION_DENIED` (New letters must be created with `isOpened: false`).

### Payload 8: Letter Timestamp Manipulation (Temporal Hijack)
A guest tries to write a letter with a customized backdated delivery timestamp to force opening.
- **Collection**: `/cartinhas/letter-2`
- **Payload**:
  ```json
  {
    "id": "letter-2",
    "title": "Backdated",
    "content": "Secret letter text",
    "sender": "Attacker",
    "recipient": "João",
    "date": "2000-01-01",
    "deliverAt": "2000-01-01",
    "stampType": "floral",
    "sealColor": "burgundy",
    "isOpened": false
  }
  ```
- **Expected Result**: `PERMISSION_DENIED` (Date must align with server or current request time).

### Payload 9: Bypassing Chat Sender Validation (Identity Spoofing)
A guest user sends a message in a conversation thread claiming to be the `owner` (João).
- **Collection**: `/conversas/familia/messages/msg-1`
- **Payload**:
  ```json
  {
    "id": "msg-1",
    "sender": "owner",
    "senderName": "João",
    "text": "I am João, I promise!",
    "timestamp": "2026-06-24T14:15:00Z"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED` (If guestName is set and isGuestMode is active, sender must be `guest`).

### Payload 10: Value Poisoning (Invalid Type Enforcements)
An attacker attempts to write an Agenda item with status set to a boolean `true` instead of a valid enum string.
- **Collection**: `/agenda/agenda-item-3`
- **Payload**:
  ```json
  {
    "id": "agenda-item-3",
    "title": "Invalid Enum",
    "date": "2026-06-24",
    "status": true,
    "priority": "low"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED` (Status must be string and one of the allowed enums).

### Payload 11: Modifying Immutable Library Contents (Conteudo File Hijack)
A guest user attempts to edit a theological sermon file in the biblioteca.
- **Collection**: `/conteudos/sermon-1`
- **Payload**:
  ```json
  {
    "id": "sermon-1",
    "name": "Modified Sermon",
    "category": "sermoes",
    "size": "5.5MB",
    "uploadDate": "2026-06-24",
    "content": "Malicious content injection"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED` (Biblioteca is read-only for guests, write-enabled only for Owner).

### Payload 12: Empty / Corrupt Data Injection
An attacker attempts to create a Recado item without a text or title field.
- **Collection**: `/recados/sticker-2`
- **Payload**:
  ```json
  {
    "id": "sticker-2",
    "color": "yellow",
    "priority": "medium",
    "isPinned": false,
    "createdAt": "2026-06-24T14:00:00Z"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED` (Required fields `title` and `text` are missing).

---

## conceptual Test Suite
A test suite (modeled conceptually inside `firestore.rules.test.ts`) executes assertions against all collections using these payloads to guarantee that they are securely rejected.
