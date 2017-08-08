set -e
set -u

parentdir="`dirname $(dirname $(readlink -f $0))`"

# lint all json files in parent directory
for file in `find $parentdir -name "*.json"` ; do
  tmpfile="/tmp/$$-`basename "$file"`"
  echo "linting $file"
  jq . "$file" > "$tmpfile"
  mv "$tmpfile" "$file"
done
