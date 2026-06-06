# Security Specification for BeSafe Firestore Security

## Data Invariants
1. **Profiles Invariant**: A user's health profile must belong to that user and cannot be read or modified by anyone else.
2. **Meals Invariant**: Meal nutrition history entries must belong to the creator; editing analyzed history is forbidden, only deletion is possible.
3. **Verified Authenticated Access**: Only users with verified emails (via Google Login) can write or access their personal metrics.

## The "Dirty Dozen" Payloads
1. **Read Profile of another user**: Attempt to fetch a profile document belonging to user B while logged in as user A. (PERMISSION_DENIED)
2. **Write Profile of another user**: Attempt to create a profile document with userId equal to user B. (PERMISSION_DENIED)
3. **Change Profile owner**: Attempt to update a profile's `userId` field to a different UID. (PERMISSION_DENIED)
4. **Change Profile createdAt**: Attempt to update a profile's `createdAt` timestamp. (PERMISSION_DENIED)
5. **Inject unverified user profile**: Attempt to write a profile when `email_verified` is false or user is anonymous. (PERMISSION_DENIED)
6. **Malicious ID Poisoning profile**: Set document ID to a massive 1MB noise string. (PERMISSION_DENIED)
7. **Malicious field injection**: Save arbitrary state fields like `isAdmin: true` in the profile document. (PERMISSION_DENIED)
8. **Invalid type for health score**: Create list item where `healthScore` is "95" string instead of number. (PERMISSION_DENIED)
9. **Update meal entries**: Attempt to modify a recorded meal analysis text. (PERMISSION_DENIED)
10. **Query other users' meals**: Client registers query for a collection of meals without filter bounds. (PERMISSION_DENIED)
11. **Inject extremely high health score value**: Force `healthScore == 999` onto the profile. (PERMISSION_DENIED)
12. **Create profile without required field**: Save a profile missing the `diabetesRisk` string. (PERMISSION_DENIED)
