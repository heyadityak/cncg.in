#!/usr/bin/env bash
# Smoke-test every subdomain of cncg.in and the in-page links that come back.
# Prints a per-URL line + a summary; non-zero exit if anything looks broken.

set -uo pipefail

# Pin DNS so we hit Cloudflare even before any wildcard DNS is in place
RESOLVE=(--resolve "cncg.in:443:172.67.131.77")
add_resolve () { RESOLVE+=(--resolve "$1:443:172.67.131.77"); }

STATES=(karnataka maharashtra gujarat delhi telangana tamil-nadu west-bengal
        kerala rajasthan uttar-pradesh odisha chandigarh uttarakhand haryana
        jharkhand)

CITIES=(bangalore mysore platform-engineering-bengaluru
        mumbai pune thane nagpur nashik aurangabad jalgaon kubernetes-pune
        ahmedabad gandhinagar rajkot vadodara surat
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
echo "=== State subdomains (15) ==="
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
echo "=== Spot-check a JS chunk via subdomain ==="
check "city _city_ chunk"  "https://pune.cncg.in/_next/static/chunks/app/city/_city_/page-c2eb102f9082377e.js"  "200"
check "state _state_ chunk" "https://karnataka.cncg.in/_next/static/chunks/app/state/_state_/page-c2eb102f9082377e.js" "200"

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
