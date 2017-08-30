import { camelize } from '@ember/string';

export default function authHintGet(gri) {
  let griMatch = gri.match(/od_(space|group)\..*\.(users|groups)/);
  if (griMatch) {
    let modelName = griMatch[1];
    return camelize(`through-${modelName}`);
  }
}
