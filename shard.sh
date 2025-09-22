# 0) paths
NDJSON=combined_puzzle_db_first_50k.ndjson
OUT=public/data/shards
mkdir -p "$OUT"

# 1) sanity check
wc -l "$NDJSON"   # expect ~50000

# 2) split into equal-sized chunks (500 lines per file ≈ 100 shards)
split -l 500 "$NDJSON" "$OUT/positions-raw-"

# 3) convert each raw chunk (NDJSON) into a JSON array
# requires jq: brew install jq  (mac)  /  sudo apt-get install jq  (linux)
for f in "$OUT"/positions-raw-*; do
  jq -s '.' "$f" > "${f/positions-raw-/positions-}.json"
  rm "$f"
done

# 4) (optional) rename with zero-padded indices for pretty URLs
i=0
for f in $(ls "$OUT"/positions-*.json | sort); do
  mv "$f" "$(printf "$OUT/positions-%03d.json" "$i")"
  i=$((i+1))
done

# 5) tiny manifest
jq -n --arg shards "$i" '{shards: ($shards|tonumber)}' > "$OUT/manifest.json"
