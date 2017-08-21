#!/bin/bash
git diff --name-only 'HEAD^1..HEAD' | grep '.*.js$' | xargs sed -i -e 's/2016 ACK CYFRONET AGH/2016-2017 ACK CYFRONET AGH/g'
