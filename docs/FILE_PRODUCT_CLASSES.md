# Shared File Across Product Classes (GenieACS 1.2.16)

The TAINET UI keeps one GridFS file per filename. In Admin > Files, `Edit classes` updates only the existing file's Product Class metadata; it does not re-upload or overwrite the firmware bytes. A new file may list multiple exact Product Classes separated by semicolons, for example `IAD200-45M; IAD200-60M`. A blank list retains the existing unrestricted behavior and makes the file available for every Product Class. Existing single-class metadata continues to work.

The Push file selector accepts a file only when every selected device's Product Class is in that list. Mixed-class batch selection therefore requires the file to list all selected classes. The actual CWMP Download still uses the original filename and file type. Direct NBI tasks can bypass the UI selector, so operators must still verify firmware compatibility before submitting an upgrade.

Validation on Debian after pulling and building the source:

1. Confirm Admin > Files contains only one row for the firmware filename. Edit its classes and confirm the size and file content are unchanged.
2. Confirm the file appears for each allowed Product Class, does not appear for an unlisted class, and appears for a mixed selection only when all selected classes are allowed.
3. Push to a test CPE. Confirm the `cwmp:Download`, `cwmp-fs` GET, and `7 TRANSFER COMPLETE` evidence.

No MongoDB migration is required: the existing `metadata.productClass` string stores a normalized semicolon-separated list. Back up `fs.files` metadata before rollout. Do not re-upload an existing filename merely to change its compatible classes.
