set -e
set -u

curdir="`dirname $(readlink -f $0)`"

# lint all json files in current directory
for file in `find $curdir -name "*.json"` ; do
  tmpfile="/tmp/$$-`basename "$file"`"
  echo "linting $file"
  jq . "$file" > "$tmpfile"
  mv "$tmpfile" "$file"
done
