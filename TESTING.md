# Web Tools Testing Guide

## Overview

This document provides comprehensive testing procedures for the web-based tools in this portfolio. While automated tests exist for CLI tools (`bundle-analyzer` and `lighthouse-enforcer`), the web tools require manual testing due to their browser-based, interactive nature.

---

## Testing Philosophy

**Why Manual Testing for Web Tools:**
1. **Browser API Dependencies**: Tools rely on Web Crypto API, Canvas API, and FileReader API which require real browser environments
2. **User Interaction**: Steganography and network analysis involve file uploads and user input that are difficult to mock
3. **Visual Verification**: LSB steganography requires visual inspection to verify image integrity
4. **CORS Constraints**: Network analyzer is subject to browser security policies that vary by environment

---

## 1. Steganography Tool (stego.html)

### Test Suite A: Encryption Correctness

**Test A1: Password-Protected Message Encoding/Decoding**
- [ ] Upload PNG image (recommended: 500x500px or larger)
- [ ] Enter message: "Test message 123!@#"
- [ ] Enter password: "SecurePass123"
- [ ] Click "EMBED MESSAGE"
- [ ] Verify download of encoded image
- [ ] Upload encoded image to decode panel
- [ ] Enter same password: "SecurePass123"
- [ ] Click "EXTRACT MESSAGE"
- [ ] ✅ **Expected**: Exact message "Test message 123!@#" appears

**Test A2: Unencrypted Message (No Password)**
- [ ] Upload PNG image
- [ ] Enter message: "No encryption test"
- [ ] Leave password blank
- [ ] Encode and decode
- [ ] ✅ **Expected**: Message successfully extracted without password

**Test A3: Wrong Password Handling**
- [ ] Encode message with password "Correct123"
- [ ] Attempt decode with password "Wrong456"
- [ ] ✅ **Expected**: Error message "Decryption failed - incorrect password or corrupted data"

### Test Suite B: Input Validation

**Test B1: Message Length Limits**
- [ ] Attempt to encode 11,000 character message
- [ ] ✅ **Expected**: Error "Message too long (max 10,000 characters)"

**Test B2: No Image Selected**
- [ ] Enter message without uploading image
- [ ] Click EMBED MESSAGE
- [ ] ✅ **Expected**: Error "No image selected"

**Test B3: Empty Message**
- [ ] Upload image but leave message empty
- [ ] Click EMBED MESSAGE
- [ ] ✅ **Expected**: Error "No message to hide"

### Test Suite C: Edge Cases

**Test C1: Special Characters**
- [ ] Test message with Unicode: "Hello 世界 🔐 Tëst"
- [ ] ✅ **Expected**: All characters preserved

**Test C2: Very Long Messages**
- [ ] Test with 5,000 character message on large image (1920x1080)
- [ ] ✅ **Expected**: Success

**Test C3: Small Image Capacity**
- [ ] Use 100x100px image with 500 character message
- [ ] ✅ **Expected**: Error "Message too large for this image"

### Test Suite D: Security Validation

**Test D1: Verify AES-256-GCM Usage**
- [ ] Open browser DevTools → Console
- [ ] Encode a message with password
- [ ] Verify console shows no errors
- [ ] Check Network tab: ✅ No external requests made
- [ ] Verify Web Crypto API is used (check for PBKDF2 in code execution)

**Test D2: Visual Integrity Check**
- [ ] Load original image
- [ ] Encode short message
- [ ] Compare original vs encoded image visually
- [ ] ✅ **Expected**: No visible difference to human eye

---

## 2. Network Analyzer (network.html)

### Test Suite E: URL Analysis

**Test E1: Successful API Request**
- [ ] Enter URL: `https://api.github.com/users/github`
- [ ] Click ANALYZE REQUEST
- [ ] ✅ **Expected**:
  - Status 200 OK displayed
  - Response headers table shown
  - Connection details table populated
  - Response preview shows JSON data
  - Request logged in log panel

**Test E2: CORS Blocked Request**
- [ ] Enter URL: `https://google.com`
- [ ] Click ANALYZE REQUEST
- [ ] ✅ **Expected**: Error message about CORS policy

**Test E3: Invalid URL**
- [ ] Enter: "not-a-url"
- [ ] ✅ **Expected**: Browser validation prevents submission OR error message

**Test E4: 404 Not Found**
- [ ] Enter: `https://api.github.com/nonexistent-endpoint-12345`
- [ ] ✅ **Expected**: Status 404 displayed with error styling

### Test Suite F: Performance Metrics

**Test F1: Resource Loading**
- [ ] Load page and wait 2 seconds
- [ ] Check "Performance Resources" panel
- [ ] ✅ **Expected**:
  - Table shows CSS, JS, font resources
  - Duration times displayed
  - Size/cached status shown

**Test F2: Stats Counter Updates**
- [ ] Note initial "Requests Logged" count
- [ ] Analyze 3 different URLs
- [ ] ✅ **Expected**: Counter increases to 3
- [ ] ✅ **Expected**: "Avg Response Time" updates
- [ ] ✅ **Expected**: "Total Data Transfer" increases

### Test Suite G: UI Behavior

**Test G1: Request Log Ordering**
- [ ] Analyze URL 1
- [ ] Wait 2 seconds
- [ ] Analyze URL 2
- [ ] ✅ **Expected**: Most recent request appears at TOP of log

**Test G2: Auto-Refresh**
- [ ] Open page
- [ ] Wait 5 seconds
- [ ] Check "Active Connections" stat
- [ ] ✅ **Expected**: Updates automatically (Performance API refresh)

---

## 3. OSINT Toolchain (osint.html)

### Test Suite H: Domain Tools

**Test H1: DNS Lookup**
- [ ] Enter domain: `github.com`
- [ ] Click DNS Lookup
- [ ] ✅ **Expected**: Links to external DNS lookup services displayed

**Test H2: IP Geolocation**
- [ ] Enter IP: `8.8.8.8`
- [ ] Click IP Geolocation
- [ ] ✅ **Expected**: Links to geolocation services with IP pre-filled

### Test Suite I: Hash Analysis

**Test I1: Hash Identifier**
- [ ] Enter: `5d41402abc4b2a76b9719d911017c592`
- [ ] Click Identify Hash
- [ ] ✅ **Expected**: Correctly identifies as MD5 (32 hex chars)

**Test I2: Base64 Decoder**
- [ ] Enter: `SGVsbG8gV29ybGQ=`
- [ ] Click Decode
- [ ] ✅ **Expected**: Output "Hello World"

---

## 4. Main Portfolio (index.html - React)

### Test Suite J: React Application

**Test J1: Page Load Performance**
- [ ] Open index.html in browser
- [ ] Check DevTools → Console for errors
- [ ] ✅ **Expected**: No errors, React renders successfully

**Test J2: System Stats Animation**
- [ ] Observe "FPS" counter in header
- [ ] ✅ **Expected**: Updates every 2 seconds (58-61 range)
- [ ] Check "MEM" counter
- [ ] ✅ **Expected**: Updates dynamically (12-15 MB range)

**Test J3: Project Card Links**
- [ ] Click each project card's "Initialize Protocol" link
- [ ] ✅ **Expected**: All links navigate correctly:
  - GHOST_CHAIN → `/osint.html`
  - BUNDLE_AUTOPSY → `/projects/bundle-analyzer`
  - LIGHTHOUSE_SENTINEL → `/projects/lighthouse-enforcer`
  - WHISPER_KEY → `/stego.html`
  - NET_INTERCEPT → `/network.html`
  - SELF_INDEX → GitHub repo

**Test J4: Responsive Design**
- [ ] Resize browser to mobile width (375px)
- [ ] ✅ **Expected**: Grid collapses to single column
- [ ] ✅ **Expected**: System stats remain visible/readable

**Test J5: Accessibility**
- [ ] Tab through page using keyboard only
- [ ] ✅ **Expected**: Focus indicators visible on all interactive elements
- [ ] Use screen reader (if available)
- [ ] ✅ **Expected**: Semantic structure announced correctly

---

## CLI Tools Testing (Automated)

### Bundle Analyzer
```bash
cd projects/bundle-analyzer
npm test
```
✅ **All tests must pass**

### Lighthouse Enforcer
```bash
cd projects/lighthouse-enforcer
npm test
```
✅ **All tests must pass**

---

## Browser Compatibility Testing

Test all web tools in:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Security Testing

### Steganography Tool
- [ ] Verify Web Crypto API usage (not XOR)
- [ ] Confirm PBKDF2 iterations = 100,000
- [ ] Check salt is random (different each time)
- [ ] Verify no network requests during encryption

### Network Analyzer
- [ ] Confirm CORS warnings displayed
- [ ] Verify no credentials sent with requests
- [ ] Check no data stored/transmitted

### OSINT Tools
- [ ] Verify legal notice displayed
- [ ] Confirm all operations client-side
- [ ] Check no data collection

---

## Performance Testing

### Load Time
- [ ] Index.html loads in < 2 seconds (on fast connection)
- [ ] React rendering completes in < 500ms
- [ ] All tools interactive within 1 second of load

### Resource Usage
- [ ] Stego tool handles 1920x1080 PNG (< 5MB)
- [ ] No memory leaks after 20+ operations
- [ ] Network analyzer handles 100+ resource entries

---

## Documentation Validation

- [ ] README.md links match actual files
- [ ] All projects listed have corresponding implementations
- [ ] Technology claims match actual usage
- [ ] No broken internal links

---

## Test Record Template

```
Test Date: _____________
Tester: ________________
Browser: _______________
OS: ____________________

Results:
[ ] All tests passed
[ ] X tests failed (document below)

Failures:
- Test ID: ______ | Issue: ____________________ | Severity: _______

Notes:
_________________________________________________________________
```

---

## Continuous Testing

**Before Each Commit:**
- [ ] Run CLI tool tests (`npm test` in both projects)
- [ ] Manually verify at least 2 critical paths per web tool
- [ ] Check README accuracy

**Before Each Release:**
- [ ] Complete ALL test suites
- [ ] Test in all supported browsers
- [ ] Validate accessibility with screen reader
- [ ] Performance profiling

---

## Known Limitations

1. **Steganography**: Maximum message size depends on image dimensions
2. **Network Analyzer**: CORS restrictions limit testable URLs
3. **OSINT Tools**: External service availability varies
4. **All Tools**: Require JavaScript enabled (no graceful degradation)

---

## Reporting Issues

When filing bugs, include:
1. Test ID that failed
2. Browser + version
3. Expected vs actual behavior
4. Steps to reproduce
5. Screenshots/error messages
