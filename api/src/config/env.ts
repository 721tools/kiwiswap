import * as dotenv from 'dotenv';

const path = {
  development: '.env.development',
  staging: '.env.staging',
  production: '.env.production',
}[process.env.NODE_ENV || 'development'];

dotenv.config({ path });