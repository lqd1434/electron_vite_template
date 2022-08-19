import { copyFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), './prod.env');
const envTargetPath = resolve(process.cwd(), './release/app/dist/main/prod.env');

try {
  copyFileSync(envPath, envTargetPath);
  console.log('prod.env 复制成功');
} catch (e) {
  console.error('复制失败');
  console.error(e);
}
