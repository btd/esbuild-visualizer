#!/bin/sh

HTML_TEMPLATES="network sunburst treemap"
TEXT_TEMPLATES="list raw-data"

for HTML_TEMPLATE in $HTML_TEMPLATES
do
  METADATA_FILE="./metafile.$HTML_TEMPLATE.json"
  echo "Render $METADATA_FILE"

  for TEMPLATE in $HTML_TEMPLATES
  do
    node ./dist/bin/cli.js --metadata $METADATA_FILE --template $TEMPLATE --filename ./stats.$HTML_TEMPLATE.$TEMPLATE.html
  done

  for TEMPLATE in $TEXT_TEMPLATES
  do
    node ./dist/bin/cli.js --metadata $METADATA_FILE --template $TEMPLATE --filename ./stats.$HTML_TEMPLATE.$TEMPLATE.txt
  done
done 