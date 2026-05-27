#!/usr/bin/env bash
# Smoke-test every subdomain of cncg.in and the in-page links that come back.
# Prints a per-URL line + a summary; non-zero exit if anything looks broken.

set -uo pipefail

# Pin DNS so we hit Cloudflare even before any wildcard DNS is in place
RESOLVE=(--resolve "cncg.in:443:172.67.131.77")
add_resolve () { RESOLVE+=(--resolve "$1:443:172.67.131.77"); }

STATES=(karnataka maharashtra gujarat delhi telangana tamil-nadu west-bengal
        kerala rajasthan uttar-pradesh odisha chandigarh-ut uttarakhand haryana
        jharkhand)

CITIES=(bangalore mysore platform-engineering-bengaluru
        mumbai pune thane nagpur nashik aurangabad jalgaon kubernetes-pune
        ahmedabad gandhinagar rajkot vadodara
        new-delhi security-india
        hyderabad
        chennai coimbatore trichy madurai pollachi
        kolkata durgapur hooghly
        kochi trivandrum kozhikode kottayam thrissur
        jaipur bikaner
        lucknow noida kanpur
        bhubaneswar chandigarh dehradun gurugram ranchi)

# Pre-build resolve flags
for s in "${STATES[@]}"; do add_resolve "$s.cncg.in"; done
for c in "${CITIES[@]}"; do add_resolve "$c.cncg.in"; done
add_resolve "www.cncg.in"
add_resolve "xyz123abc.cncg.in"

PASS=0
FAIL=0
FAILED_URLS=()

check () {
  local label=$1
  local url=$2
  local expected=$3  # e.g. "200" or "200,301"

  # 5 second timeout, follow at most 3 redirects so loops fail fast
  local code
  code=$(curl -sk -o /dev/null -w "%{http_code}" \
    --max-redirs 3 --connect-timeout 5 --max-time 15 \
    "${RESOLVE[@]}" "$url" 2>/dev/null || echo "000")

  if [[ ",$expected," == *",$code,"* ]]; then
    printf "  ✓ %-45s %s\n" "$label" "$code"
    PASS=$((PASS + 1))
  else
    printf "  ✗ %-45s %s (expected %s)\n" "$label" "$code" "$expected"
    FAIL=$((FAIL + 1))
    FAILED_URLS+=("$url -> $code")
  fi
}

echo "=== Root & canonical ==="
check "cncg.in/"            "https://cncg.in/"            "200"
check "www.cncg.in/ (→301)" "https://www.cncg.in/"        "301"

echo ""
echo "=== State subdomains (${#STATES[@]}) ==="
for s in "${STATES[@]}"; do
  check "$s.cncg.in/" "https://$s.cncg.in/" "200"
done

echo ""
echo "=== City subdomains (${#CITIES[@]}) ==="
for c in "${CITIES[@]}"; do
  check "$c.cncg.in/" "https://$c.cncg.in/" "200"
done

echo ""
echo "=== Unknown subdomain (should hard-redirect) ==="
check "xyz123abc.cncg.in/ (→301)" "https://xyz123abc.cncg.in/" "301"

echo ""
echo "=== Spot-check static assets via subdomain ==="
check "city favicon"   "https://pune.cncg.in/favicon.ico"   "200"
check "state favicon"  "https://karnataka.cncg.in/favicon.ico" "200"

# Discover a JS chunk from each page HTML (hashes change every build)
extract_chunk () {
  local base=$1
  curl -sk --connect-timeout 5 --max-time 15 "${RESOLVE[@]}" "$base" 2>/dev/null \
    | grep -oE '/_next/static/[^"'"'"']+\.js' | head -1
}

city_chunk=$(extract_chunk "https://pune.cncg.in/")
state_chunk=$(extract_chunk "https://karnataka.cncg.in/")

if [[ -n "$city_chunk" ]]; then
  check "city page JS chunk" "https://pune.cncg.in$city_chunk" "200"
else
  printf "  ✗ %-45s %s (expected %s)\n" "city page JS chunk" "missing" "200"
  FAIL=$((FAIL + 1))
  FAILED_URLS+=("https://pune.cncg.in/ -> no _next/static chunk in HTML")
fi

if [[ -n "$state_chunk" ]]; then
  check "state page JS chunk" "https://karnataka.cncg.in$state_chunk" "200"
else
  printf "  ✗ %-45s %s (expected %s)\n" "state page JS chunk" "missing" "200"
  FAIL=$((FAIL + 1))
  FAILED_URLS+=("https://karnataka.cncg.in/ -> no _next/static chunk in HTML")
fi

echo ""
echo "=== Summary ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "Failures:"
  for f in "${FAILED_URLS[@]}"; do
    echo "  - $f"
  done
  exit 1
fi
exit 0
